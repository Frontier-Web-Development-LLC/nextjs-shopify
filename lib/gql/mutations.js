import gql from 'graphql-tag';

export const CREATE_BASKET_METAFIELD = gql`
  mutation($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        metafields(first: 100) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_BASKET_ITEMS = gql`
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        updatedAt
        metafields(first: 10) {
          edges {
            node {
              id
              key
              namespace
              value
              valueType
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_BASKET_METAFIELD = gql`
  mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;
