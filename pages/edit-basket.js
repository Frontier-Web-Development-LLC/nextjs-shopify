import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ENDPOINT } from '../lib/gql/constants';
import { GET_PRODUCT_BY_ID } from '../lib/gql/queries';
import {
  UPDATE_BASKET_ITEMS,
  CREATE_BASKET_METAFIELD,
} from '../lib/gql/mutations';
import { Page, Button } from '@shopify/polaris';
import {
  useAppBridge,
  ResourcePicker,
  TitleBar,
} from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

import { request } from 'graphql-request';
import MetafieldQueryContainer from '../components/MetafieldQueryContainer';

const EditProduct = () => {
  const [updateLoading, setUpdateLoading] = useState(true);
  const [productId, setProductId] = useState(null);
  const [productData, setProductData] = useState(null);
  const [open, setOpen] = useState(false);

  const app = useAppBridge();
  const router = useRouter();

  useEffect(() => {
    if (!productId) {
      setProductId(router.query.product);
    }
  }, []);

  const refreshFetch = async () => {
    const res = await request(ENDPOINT, GET_PRODUCT_BY_ID, {
      id: 'gid://shopify/Product/' + productId,
    });
    setProductData(res);
    setUpdateLoading(false);
    return res;
  };

  const addToBasket = async (uniqueCombinedValues, uniqueCombinedHandles) => {
    const res = await request(ENDPOINT, UPDATE_BASKET_ITEMS, {
      input: {
        id: productData.product.id,
        metafields: [
          {
            id: productData.product.metafields.edges[0].node.id,
            value: uniqueCombinedValues.join(','),
            valueType: 'STRING',
          },
          {
            id: productData.product.metafields.edges[1].node.id,
            value: uniqueCombinedHandles.join(','),
            valueType: 'STRING',
          },
        ],
      },
    });
    await refreshFetch();
  };

  const createBasketMetafield = async (
    uniqueCombinedValues,
    uniqueCombinedHandles
  ) => {
    const res = await request(ENDPOINT, CREATE_BASKET_METAFIELD, {
      input: {
        id: productData.product.id,
        metafields: [
          {
            namespace: 'ProductData',
            key: 'basketData',
            value: uniqueCombinedValues.join(','),
            valueType: 'STRING',
          },
          {
            namespace: 'ProductData',
            key: 'basketHandles',
            value: uniqueCombinedHandles.join(','),
            valueType: 'STRING',
          },
        ],
      },
    });
    await refreshFetch();
  };

  useEffect(() => {
    !productData && refreshFetch();
  });

  useEffect(() => {
    productId && refreshFetch();
  }, [updateLoading]);

  // takes ids of selected resources, compares them against existing ids, adds baskets corresponding with ids that don't already exist
  const handleSelection = async (resources) => {
    let existingValues = [];
    let existingHandles = [];

    if (productData.product?.metafields?.edges[0]?.node?.value) {
      const initialExistingValues =
        productData.product.metafields.edges[0].node.value;
      existingValues = initialExistingValues.split(',').map((value) => value);
    }

    const newValues = resources.selection.map((product) => product.id);
    const combinedValues = [...existingValues, ...newValues];
    const uniqueCombinedValues = [...new Set(combinedValues)];

    if (productData.product?.metafields?.edges[1]?.node?.value) {
      const initialExistingHandles =
        productData.product.metafields.edges[1].node.value;
      existingHandles = initialExistingHandles.split(',').map((value) => value);
    }

    const newHandles = resources.selection.map((product) => product.handle);
    const combinedHandles = [...existingHandles, ...newHandles];
    const uniqueCombinedHandles = [...new Set(combinedHandles)];

    if (productData.product.metafields?.edges[0]?.node) {
      addToBasket(uniqueCombinedValues, uniqueCombinedHandles);
    } else {
      createBasketMetafield(uniqueCombinedValues, uniqueCombinedHandles);
    }
    setOpen(false);
  };

  const backToAllBaskets = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, '/?status=refresh');
  };
  return (
    <Page>
      <TitleBar
        title='Basket Details'
        primaryAction={{
          content: 'Add products to basket',
          onAction: () => setOpen(true),
        }}
      />
      <ResourcePicker
        resourceType='Product'
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
      {productData && (
        <>
          <p>
            <strong>Note:</strong> Basket product options will be listed on the
            product page in the order they appear below.
          </p>
          <div style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                textAlign: 'center',
                marginBottom: '2rem',
                fontWeight: 'bolder',
              }}
            ></h3>
            <MetafieldQueryContainer
              product={productData.product}
              ids={productData.product?.metafields?.edges[0]?.node?.value.split(
                ','
              )}
              handles={productData.product?.metafields?.edges[1]?.node?.value.split(
                ','
              )}
              valueMetafieldId={
                productData.product?.metafields?.edges[0]?.node?.id
              }
              handleMetafieldId={
                productData.product?.metafields?.edges[1]?.node?.id
              }
              setUpdateLoading={setUpdateLoading}
            />
          </div>

          <Button onClick={() => backToAllBaskets()}>Back</Button>
        </>
      )}
    </Page>
  );
};

export default EditProduct;
