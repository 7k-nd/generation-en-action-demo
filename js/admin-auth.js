(function () {
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const isLogin = file === "index.html" || file === "" || file === "admin";
  const ok = sessionStorage.getItem("gea_admin") === "1";
  if (!isLogin && !ok) {
    location.replace("index.html");
    return;
  }
  if (isLogin && ok) {
    location.replace("dashboard.html");
  }
})();
