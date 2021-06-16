import gql from 'graphql-tag';

export const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        metafields(first: 5, namespace: "ProductData") {
          edges {
            node {
              key
              id
              value
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query($id: ID!) {
    product(id: $id) {
      title
      handle
      descriptionHtml
      id
      images(first: 1) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      metafields(first: 5, namespace: "ProductData") {
        edges {
          node {
            key
            id
            value
          }
        }
      }
    }
  }
`;
