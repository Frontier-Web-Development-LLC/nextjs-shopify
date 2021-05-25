const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });
const q = faunadb.query;

export default async (req, res) => {
  const productArray = req.body.split(',');
  try {
    try {
      await client.query(
        q.Foreach(
          productArray,
          q.Lambda(
            'product',
            q.Create(q.Collection('baskets'), {
              data: { productId: q.Var('product') },
            })
          )
        )
      );
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ msg: 'Success' });
  } catch (error) {
    console.log(error);
    res.status(400);
  }
};
