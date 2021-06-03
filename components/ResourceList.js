import React from 'react';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from '@shopify/polaris';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import { GET_PRODUCTS_BY_ID } from '../lib/gql/queries';

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  render() {
    const app = this.context;
    const redirectToProduct = (id) => {
      const idString = id.split('/').pop();
      console.log(idString);
      const redirect = Redirect.create(app);
      redirect.dispatch(
        Redirect.Action.APP,
        `/edit-basket?product=${idString}`
      );
    };

    return (
      <Query
        query={GET_PRODUCTS_BY_ID}
        variables={{ ids: this.props.productIds }}
      >
        {({ data, loading, error }) => {
          if (loading) {
            return <div>Loading…</div>;
          }
          if (error) {
            return <div>{error.message}</div>;
          }
          return (
            <Card>
              <ResourceList
                showHeader
                resourceName={{ singular: 'Basket', plural: 'Baskets' }}
                items={data.nodes}
                renderItem={(item) => {
                  const media = (
                    <Thumbnail
                      source={
                        item.images.edges[0]
                          ? item.images.edges[0].node.originalSrc
                          : ''
                      }
                      alt={
                        item.images.edges[0]
                          ? item.images.edges[0].node.altText
                          : ''
                      }
                    />
                  );
                  const price = item.variants.edges[0].node.price;
                  return (
                    <ResourceList.Item
                      id={item.id}
                      media={media}
                      accessibilityLabel={`View details for ${item.title}`}
                      onClick={() => {
                        redirectToProduct(item.id);
                      }}
                    >
                      <Stack>
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation='strong'>
                              {item.title}
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                        <Stack.Item>
                          <p>${price}</p>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ResourceListWithProducts;
