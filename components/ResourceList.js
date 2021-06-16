import React from 'react';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Icon,
  Badge,
} from '@shopify/polaris';
import { Redirect } from '@shopify/app-bridge/actions';
import { Context } from '@shopify/app-bridge-react';
import { GET_PRODUCTS_BY_ID } from '../lib/gql/queries';
import { sortBy } from 'lodash';
import { DeleteMajor } from '@shopify/polaris-icons';

class ResourceListWithProducts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      baskets: [],
      sortParam: 'name_desc',
    };

    this.sortData = this.sortData.bind(this);
    this.updateBaskets = this.updateBaskets.bind(this);
  }

  static contextType = Context;

  updateBaskets(data) {
    if (
      this.state.baskets.length === 0 ||
      this.state.baskets.length !== this.props.productIds.length
    ) {
      this.setState({
        baskets: sortBy(data.nodes, (node) => node.title),
      });
    }
  }

  render() {
    const app = this.context;

    const redirectToProduct = (id) => {
      const idString = id.split('/').pop();
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
        fetchPolicy='no-cache'
      >
        {({ data, loading, error }) => {
          if (loading) {
            return <div>Loading…</div>;
          }
          if (error) {
            return <div>{error.message}</div>;
          }

          this.updateBaskets(data);

          return (
            !this.state.topLoading && (
              <Card>
                <ResourceList
                  showHeader
                  resourceName={{ singular: 'Basket', plural: 'Baskets' }}
                  items={this.state.baskets}
                  sortValue={this.state.sortParam}
                  sortOptions={[
                    { label: 'Title (A to Z)', value: 'name_desc' },
                    { label: 'Title (Z to A)', value: 'name_asc' },
                  ]}
                  onSortChange={(selected) => {
                    this.setState({ sortParam: selected });
                    this.setState({
                      baskets: this.sortData(this.state.sortParam),
                    });
                  }}
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
                            {!item.metafield ? (
                              <Badge status='info'>Pending</Badge>
                            ) : (
                              <Badge status={'success'}>Active</Badge>
                            )}
                          </Stack.Item>
                          <div
                            style={{ zIndex: '999' }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              await this.props.handleDeletion(
                                item.id,
                                item.metafields.edges[0]?.node?.id
                              );
                              await this.props.handleDeletion(
                                item.id,
                                item.metafields.edges[1]?.node?.id
                              );
                            }}
                          >
                            <Stack.Item>
                              <Icon source={DeleteMajor} color='red' />
                            </Stack.Item>
                          </div>
                        </Stack>
                      </ResourceList.Item>
                    );
                  }}
                />
              </Card>
            )
          );
        }}
      </Query>
    );
  }

  sortData(param) {
    const { baskets } = this.state;

    if (param === 'name_desc') {
      const sortedBaskets = sortBy(baskets, (basket) => basket.title).reverse();
      return sortedBaskets;
    } else if (param === 'name_asc') {
      const sortedBaskets = sortBy(baskets, (basket) => basket.title);
      return sortedBaskets;
    }

    return;
  }
}

export default ResourceListWithProducts;
