import type { MetaFunction } from "@remix-run/node";
import { Header } from "../components/Header";
import { UrlForm } from "../components/UrlForm";
import Container from "~/components/layout/Container";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <Container>
        <Header />
        <h1>Willkommen zu deinem ersten Remix-Projekt!</h1>
        <p>Los gehts mit dem Scraping</p>
        <UrlForm />
      </Container>
    </>
  );
}
