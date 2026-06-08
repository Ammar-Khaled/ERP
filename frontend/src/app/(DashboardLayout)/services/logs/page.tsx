import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import LogsComponent from "./LogsComponent";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Basic Table",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Basic Table" items={BCrumb} />
      <LogsComponent />
    </>
  );
};

export default page;
