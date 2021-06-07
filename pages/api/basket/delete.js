const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });
const q = faunadb.query;

export default async (req, res) => {
  const product = req.query.product;
  try {
    const records = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('baskets')), { size: 100000 }),
        q.Lambda((x) => q.Get(x))
      )
    );

    const selectedBasket = records.data.find(
      (record) => record.data.productId === product
    );

    await client.query(q.Delete(selectedBasket.ref));

    res.status(200).json({ msg: 'Success' });
  } catch (error) {
    console.log(error);
    res.status(400);
  }
};
