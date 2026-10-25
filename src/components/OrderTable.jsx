export default function OrderTable({ orders }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Order No.</th>
          <th>Customer</th>
          <th>Site</th>
          <th>Order Date</th>
          <th>Status</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.SalesId}>
            <td>{order.SalesId}</td>
            <td>{order.SalesName}</td>
            <td>{order.InventSiteId}</td>
            <td>{order.CreatedDateTime1}</td>
            <td>{order.SalesStatus}</td>
            <td>{order.HAR_TotalSOAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}