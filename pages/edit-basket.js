import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GET_PRODUCT_BY_ID } from '../lib/gql//queries';
import { Page } from '@shopify/polaris';
import {
  useAppBridge,
  ResourcePicker,
  TitleBar,
} from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

import { Query, Mutation } from 'react-apollo';

const EditProduct = () => {
  const [productId, setProductId] = useState(null);

  const app = useAppBridge();
  const router = useRouter();

  useEffect(() => {
    if (!productId) {
      setProductId(router.query.product);
    }
  }, []);

  const backToAllBaskets = () => {
    const redirect = Redirect.create(app);
    redirect.dispatch(Redirect.Action.APP, '/');
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
      {productId && (
        <>
          <Query query={GET_PRODUCT_BY_ID} variables={{ id: productId }}>
            {({ data, loading, error }) => {
              if (loading) {
                return <div>Loading…</div>;
              }
              if (error) {
                return <div>{error.message}</div>;
              }
              return <p>TEST</p>;
            }}
          </Query>
          <button onClick={() => backToAllBaskets()}>Back</button>
        </>
      )}
    </Page>
  );
};

export default EditProduct;
