import Header from './components/header/header';// Import the Header component

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="p-10 text-center">
        <h1 className="text-4xl font-bold">Welcome to My Website</h1>
        <p className="mt-4 text-lg text-gray-600">Your journey starts here.</p>
      </main>
    </>
  );
}
