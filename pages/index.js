import React, { useEffect, useState } from 'react';
import { Page, Layout, EmptyState, Banner } from '@shopify/polaris';
import { authenticateShopifyPage } from '@bluebeela/nextjs-shopify-auth';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import ResourceListWithProducts from '../components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [baskets, setBaskets] = useState(null);
  const [showToast, setToast] = useState(false);

  const getAllProducts = async () => {
    const res = await (await fetch('/api/basket/all')).json();
    setBaskets(res);
    setLoading(false);
  };

  // this function: takes ids of selected resources, compares them against existing ids, adds baskets corresponding with ids that don't already exist
  const handleSelection = async (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    const basketIds = baskets.map((product) => product.productId);
    const trimmedResources = idsFromResources.filter(
      (id) => !basketIds.includes(id)
    );

    if (trimmedResources.length > 0) {
      fetch('/api/basket/create', { method: 'POST', body: trimmedResources })
        .then((res) => res.json())
        .then(async (data) => await getAllProducts());
    } else {
      setToast(true);
    }

    setOpen(false);
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    !loading && (
      <Page>
        <TitleBar
          title='All Baskets'
          primaryAction={{
            content: 'Create baskets',
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
        {!baskets || !baskets.length > 0 ? (
          <Layout>
            <EmptyState
              heading='Create baskets of various products.'
              action={{
                content: 'Create baskets',
                onAction: () => setOpen(true),
              }}
              image={img}
            >
              <p>Select base products for bundles and baskets.</p>
            </EmptyState>
          </Layout>
        ) : (
          <>
            <ResourceListWithProducts
              productIds={baskets.map((product) => product.productId)}
            />
            {showToast && (
              <Banner
                title='No baskets added'
                status='warning'
                onDismiss={() => {
                  setToast(false);
                }}
              >
                <p>Duplicate baskets cannot be created</p>
              </Banner>
            )}
          </>
        )}
      </Page>
    )
  );
};

export const getServerSideProps = authenticateShopifyPage();

export default Index;
