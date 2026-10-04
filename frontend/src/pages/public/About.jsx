export default function About() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold">About Marigold</h1>
        <p className="mt-4 text-ink-soft">Marigold is a demo online store built to show a complete shopping experience: browsing, cart, checkout and order tracking, plus an admin dashboard to run the catalog.</p>
        <p className="mt-3 text-ink-soft">Payments in this demo are simulated (Cash on Delivery, mock card and mock UPI) so you can try the full flow without entering real payment details.</p>
        <h2 className="mt-8 text-xl font-bold">What you will find here</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
          <li>A catalog across electronics, fashion, home, beauty, fitness and books</li>
          <li>Search, filters and sorting to find what you need</li>
          <li>Wishlist, cart and a guided checkout</li>
          <li>Order history with live status updates</li>
        </ul>
      </div>
    </div>
  );
}
