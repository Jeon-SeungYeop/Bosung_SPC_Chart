import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useMenuStore from "@/services/store/useMenuStore";
import { toast } from "react-toastify";

export default function AppRouterGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuItems } = useMenuStore();

  
  useEffect(() => {
    if (menuItems.length === 0) return; // 아직 메뉴 불러오기 전이면 skip

    const currentPath = location.pathname;

    // 검사하지 않을 경로 목록 (화이트리스트)
    const publicPaths = ["/", "/login", "/processqualitytrand"];

     const allowedPaths = menuItems
      .flat() // [[{}, {}], [{}]] → [{}, {}, {}]
      .map((item) => item.child)
      .filter(Boolean)
      .flat()
      .map((detail) => detail.childlink);

    // 현재 경로가 포함되는지 확인
    const isAllowed = allowedPaths.some((path) =>
      currentPath === "/" + path || currentPath.startsWith("/" + path + "/")
    );

    // public path는 검사하지 않음
    if (publicPaths.includes(currentPath)) return;

    if (!isAllowed && currentPath !== "/404") {
        navigate("/404", { 
            replace: true,
            state: { errorMessage: "접근 권한이 없거나 없는 페이지입니다. 5초 뒤 메인화면으로 이동합니다."}
        });

        // 5초 후 이동
        setTimeout(() => {
            navigate("/IntegratedDashboard", { replace: true });
        }, 5000);

    }
  }, [location.pathname, menuItems, navigate]);

  return children;
}
