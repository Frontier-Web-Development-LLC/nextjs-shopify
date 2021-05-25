import React, { useEffect, useState } from 'react';
import { Page, Layout, EmptyState } from '@shopify/polaris';
import { authenticateShopifyPage } from '@bluebeela/nextjs-shopify-auth';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import ResourceListWithProducts from '../components/ResourceList';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

const Index = () => {
  const [open, setOpen] = useState(false);
  const [baskets, setBaskets] = useState(null);

  const handleSelection = (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    fetch('/api/basket/create', { method: 'POST', body: idsFromResources })
      .then((res) => res.json())
      .then((data) => console.log(data));
    setOpen(false);
  };

  useEffect(() => {
    fetch('/api/basket/all')
      .then((res) => res.json())
      .then((data) => setBaskets(data));
  }, []);

  return (
    <Page>
      <TitleBar
        title='NextJS Example App'
        primaryAction={{
          content: 'Select products',
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
              content: 'Select base products',
              onAction: () => setOpen(true),
            }}
            image={img}
          >
            <p>Select base products for bundles and baskets.</p>
          </EmptyState>
        </Layout>
      ) : (
        <ResourceListWithProducts />
      )}
    </Page>
  );
};

export const getServerSideProps = authenticateShopifyPage();

export default Index;
