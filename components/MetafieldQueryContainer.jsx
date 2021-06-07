import React, { useState, useEffect } from 'react';
import { GET_PRODUCTS_BY_ID } from '../lib/gql/queries';
import {
  UPDATE_BASKET_ITEMS,
  DELETE_BASKET_METAFIELD,
} from '../lib/gql/mutations';
import { Query, useMutation } from 'react-apollo';
import { Card, OptionList } from '@shopify/polaris';

const MetafieldQueryContainer = ({
  product,
  ids,
  metafieldId,
  setUpdateLoading,
}) => {
  const [selected, setSelected] = useState([]);
  const [selectFilter, setSelectFilter] = useState([]);
  const [handleRemoveFromBasket, { data }] = useMutation(UPDATE_BASKET_ITEMS);
  const [handleDeleteBasketMetafield, { metafieldData }] = useMutation(
    DELETE_BASKET_METAFIELD
  );

  const removeController = async () => {
    if (selectFilter.length > 0) {
      await handleRemoveFromBasket({
        variables: {
          input: {
            id: product.id,
            metafields: [
              {
                id: metafieldId,
                value: selectFilter.join(','),
                valueType: 'STRING',
              },
            ],
          },
        },
      });
    } else {
      await handleDeleteBasketMetafield({
        variables: {
          input: {
            id: metafieldId,
          },
        },
      });
    }
    setUpdateLoading(true);
  };

  useEffect(() => {
    if (ids) {
      setSelectFilter(ids.filter((id) => !selected.includes(id)));
    }
  }, [selected]);

  return ids && ids.length > 0 ? (
    <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: ids }}>
      {({ data, loading, error }) => {
        if (loading) {
          return <div>Loading Bundled Items…</div>;
        }
        if (error) {
          return <div>{error.message}</div>;
        }

        const options = data.nodes.map((item) => {
          return { value: item.id, label: item.title };
        });

        return (
          <Card
            title='Products in Basket'
            primaryFooterAction={{
              content: 'Remove selected product',
              onAction: () => removeController(),
            }}
          >
            <Card.Section>
              <OptionList
                options={options}
                selected={selected}
                onChange={setSelected}
              ></OptionList>
            </Card.Section>
          </Card>
        );
      }}
    </Query>
  ) : (
    <Card>
      <Card.Section>
        <p>No Products in Basket</p>
      </Card.Section>
    </Card>
  );
};

export default MetafieldQueryContainer;
