import { Outlet } from "react-router";
import NavBar from "../component/NavBar";
import Footer from "../component/Footer";

function Root() {
  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
}
export default Root;