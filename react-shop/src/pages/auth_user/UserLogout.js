import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authUserApi from "../../api/authUserApi";

const UserLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authUserApi.logout();
    navigate("/");
  }, [navigate]);

  return null;
};

export default UserLogout;
