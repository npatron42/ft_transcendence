import { useNavigate } from "react-router-dom";
import { setJwt, getUser } from "../api/api";
import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "./check.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Check42User = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get("code");

      if (codeFromUrl) {
        try {
          await setJwt(codeFromUrl);
          const newJwt = localStorage.getItem("jwt");

          const user = await getUser();
          const userLangue = user.langue;

          if (user.sup) {
            localStorage.clear();
            navigate("/");
            Swal.fire({
              title: t("loginPage.sup"),
              text: t("loginPage.sup2"),
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                popup: "custom-swal-popup",
                title: "custom-swal-title",
                text: "custom-swal-text",
                confirmButton: "custom-swal-button",
              },
            });
          } else {
            localStorage.setItem("i18nextLng", userLangue);
            sessionStorage.removeItem("i18nextLng");

            if (localStorage.getItem("jwt") && localStorage.getItem("i18nextLng")) {
              navigate("/home");
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div id="background-container">
      <div className="loader"></div>
    </div>
  );
};

export default Check42User;
