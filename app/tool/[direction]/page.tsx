import App from "../../App";

export default function Tool({ params }: { params: { direction: string } }) {
  const { direction } = params;

  return <App defaultDirection={decodeURI(direction)} />;
}
