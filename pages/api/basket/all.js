const faunadb = require('faunadb');
const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });
const q = faunadb.query;

export default async (req, res) => {
  try {
    const records = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('baskets')), { size: 100000 }),
        q.Lambda((x) => q.Get(x))
      )
    );

    const baskets = records.data.map((record) => record.data);

    res.status(200).json(baskets);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
};
