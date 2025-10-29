import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { useApiUrl } from "@/context/APIContext"; //
import { setUser } from "@/services/store/api/auth/authSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
// import { menuItems } from "@/components/autocomponent/common/_data";
import useMenuStore from "@/services/store/useMenuStore";
import { CommonFunction, Auto_SearchDropDown, DropDownItemGetter, } from "@/components/autocomponent";
import Loading from "@/components/Loading";
import * as yup from "yup";
import Checkbox from "@/components/ui/Checkbox";
import { availablePaths } from "@/context/_data";


// 신규 매뉴 등록 순서 
// 1. 시스템 관리 의 매뉴 등록
// 2. 사용자권한 별 매뉴 관리 등록 
// 3. App.jsx 에 매뉴 리스트 등록 (70 행 , 130 행 2군데)
// 4. Layout.jsx 에 매뉴 리스트 등록 (30행,  80 행 참조 )


// 유효성 검사 스키마
const schema = yup
  .object({
    userid: yup.string().required("사용자 ID 를 입력하세요"),
    password: yup.string().required("비밀번호를 입력하세요"),
  })
  .required();

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const apiUrl = useApiUrl(); // URL

  //   // 임시 로그인 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //   const userid = "autovation";
  // const password = "autovation";

  // // 서버 응답 없이 직접 사용자 정보를 설정
  // const fakeResponseData = {
  //   jhedher: {
  //     status: "S", // 성공 상태를 가정
  //     db_msg: "오배선", // 사용자 메시지
  //   },
  //   userid: userid,
  //   username: "오배선",
  // };
  //   // 임시 로그인 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // plantcode 관련 부분
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    lang: "",
  });
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);

  // 메뉴 목록 저장용
  const setMenuItems = useMenuStore((state) => state.setMenuItems);

  // 아이디 기억 체크박스용
  const [isRemember, setIsRemember] = useState(false);
  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["rememberUserId", "rememberPassword"]);

  useEffect(() => {
    // 저장된 쿠키값이 있으면, CheckBox TRUE 및 UserID에 값 셋팅
    if (cookies.rememberUserId !== undefined && cookies.rememberPassword !== undefined) {
      setUserid(cookies.rememberUserId);
      setUserpw(cookies.rememberPassword);
      setIsRemember(true);
    }
  }, []);

  // 아이디 기억하기 체크박스 변경 이벤트
  const handleOnRememberCheck = (e) => {
    setIsRemember(e.target.checked);
    if (!e.target.checked) {
      removeCookie("rememberUserId");
      removeCookie("rememberPassword");
    }
  };

  // 로그인 요청 및 처리
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const requestData = {
        userid: data.userid,
        password: data.password,
        plantcode: searchParams.plantcode?.value ?? dropdownData.plantcode.items[0].value,
        lang: searchParams.lang?.value ?? dropdownData.lang.items[0].value,
      };

      const url = `${apiUrl}sys/login-menulist`;
      // 서버에 로그인 요청
      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // 쿠키로 refresh token 보낼 경우 필요
      });

      const { jhedher, jbody } = response.data;

      // 에러 처리
      if (jhedher?.status === "I" || jhedher?.status === "P") {
        handleServerError(jhedher);
        return;
      }

      // 기억하기 체크박스 클릭되어있으면 쿠키에 저장
      if (isRemember) {
        setCookie("rememberUserId", data.userid, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7일간 기억
        });
        setCookie("rememberPassword", data.password, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7일간 기억
        });
      } else {
        removeCookie("rememberUserId");
        removeCookie("rememberPassword");
      }

      //로그인 성공 시 처리
      handleLoginSuccess(response, jhedher, jbody, data);

      // // 임시 로그인 /////////////////////////////////////////////////////////////////////////////////
      // // Redux에 사용자 정보 저장
      // dispatch(setUser(fakeResponseData));

      // // localStorage에 수동으로 저장
      // localStorage.setItem("userid", JSON.stringify(userid));
      // localStorage.setItem("username", JSON.stringify(fakeResponseData.jhedher.db_msg));

      // // 대시보드로 이동
      // navigate("/dashboard2");
      ///////////////////////////////////////////////////////////////////////////////////////////
    } catch (error) {
      console.error("로그인 오류:", error);
      toast.error(error.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false); // 🔹 요청 완료 후 로딩 상태 비활성화
    }
  };

  // 서버 에러 처리
  const handleServerError = (jhedher) => {
    const field = jhedher?.status === "I" ? "userid" : "password";
    setError(field, {
      type: "server",
      message: jhedher.db_msg,
    });
  };

  // 로그인 성공 시 처리
  const handleLoginSuccess = (response, jhedher, jbody, logindata) => {
    dispatch(setUser(response.data));
    navigate("/IntegratedDashboard");

    // 공장 과 사용자 이름 '_' 으로 구분하여 dbMsg 로 전달 받음
    const dbMsg = jhedher?.db_msg || "";
    const [plantcode, username, usergroup, lang] = dbMsg.split("_");

    // 저장
    localStorage.setItem("plantcode", JSON.stringify(plantcode));
    localStorage.setItem("userid", JSON.stringify(logindata.userid));
    localStorage.setItem("username", JSON.stringify(username));
    localStorage.setItem("usergroup", JSON.stringify(usergroup)); // 사용자 그룹. 
    localStorage.setItem("lang", JSON.stringify(lang));

    // jheader로 받은 토큰 저장
    const token = jhedher.token;
    localStorage.setItem("token", token);

    // 새로고침 후에도 menu 그대로 불러오게 저장 
    localStorage.setItem("menuitems",  JSON.stringify(jbody));
    // 매뉴 트리 재구성. !!!!!
    // ui/Breadcrumbs.jsx 에서 매뉴 트리 구성함 
    setMenuItems(jbody);


    // 매뉴 기본 설정 데이터 에 권한 정보  등록   
    for (let i = 0; i < availablePaths.length; i++) {
      const currentPath = availablePaths[i].path.replace("/", "");

      if (Array.isArray(jbody)) {
        for (const menu of jbody) {
          if (menu.child && Array.isArray(menu.child)) {
            const matchedItem = menu.child.find(child => child.childlink === currentPath);
            if (matchedItem) {
              availablePaths[i].modifymanageauth = matchedItem.modifymanageauth; // 수정 권한 
              availablePaths[i].exceluploadauth = matchedItem.exceluploadauth;   // 엑셀 업로드권한 
              availablePaths[i].exceldownloadauth = matchedItem.exceldownloadauth;  // 엑셀 다운로드 권한 
            }
          }
        }
      }  
    }

    console.log(availablePaths);
    localStorage.setItem("path", JSON.stringify(availablePaths));

  };
  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    lang: { items: [], mappings: {} },
  });

  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, langAll] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 조회부 콤보박스  필수 입력! 
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "lang", param4: "X" }),  // 조회부 콤보박스  필수 입력! 
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeAll) },
          lang: { items: langAll, mappings: CommonFunction.convertData(langAll) },
        });
      } catch (error) {
      }
    };

    loadDropdownData();
  }, [apiUrl]);

  return (
    <>
      {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex w-full">
            <label className={`capitalize form-label -mb-2 w-[308px]`}>사업장</label>
            <label className={`capitalize form-label -mb-2 w-[132px]`}>언어</label>
          </div>
          <div className="flex w-full space-x-2">
            <Auto_SearchDropDown
              onChange={(item) => updateSearchParams("plantcode", item)}
              inputWidth="300px"
              horizontal
              dropDownData={dropdownData.plantcode.items}
              labelSpacing={'mr-3'}
              height="h-[48px]"
            />
            <Auto_SearchDropDown
              onChange={(item) => updateSearchParams("lang", item)}
              id={"lang"}
              inputWidth="132px"
              horizontal
              dropDownData={dropdownData.lang.items}
              labelSpacing={'mr-3'}
              height="h-[48px]"
            />
          </div>
          <Textinput
            name="userid"
            label="사용자 ID"
            defaultValue={userid}
            register={register}
            error={errors.userid}
            className="h-[48px]"
            onChange={(e) => {
              setUserid(e.target.value);
            }}
          />
          <Textinput
            name="password"
            label="사용자 비밀번호"
            type="password"
            defaultValue={userpw}
            register={register}
            error={errors.password}
            className="h-[48px]"
            onChange={(e) => {
              setUserpw(e.target.value);
            }}
          />
          <Checkbox
            value={isRemember}
            onChange={handleOnRememberCheck}
            label={
              <>
                <span className="text-slate-900  dark:text-slate-300 font-medium">
                  {" "}
                  아이디/비밀번호 기억하기
                </span>
              </>
            }
          />
          <Button
            type="submit"
            text="Sign in"
            className="btn btn-dark block w-full text-center"
            isLoading={loading}
          />
        </form>
      )}
    </>
  );
};

export default LoginForm;
