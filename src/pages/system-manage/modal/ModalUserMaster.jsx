import React, { useState, useEffect } from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form"; // FormProvider added
import { Auto_Label_Text_Set, Auto_Checkbox, DropDownItemGetter, Auto_SearchDropDown } from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";
import dropdown from "@/components/pages-components/dropdown";

// setExcuteSuccesAndSearch : 메인그리드의 재조회 여부
const ModalCommonCodesGroupAdd = ({
  activeModal,
  onClose,
  setExcuteSuccesAndSearch,
}) => {
  const apiUrl = useApiUrl();
  const [chkuseflag, setChkuseflag] = useState(true);
  const [message, setMessage] = useState(""); // 메시지 상태 추가

  // 사업장
  const [ plantcode, setPlantCode ] = useState(null);
  const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]);
  // 사업장 그룹 데이터 받아오기
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1 : 'common' , param2 : '1000' , param3: "plantcode", param4: "X" });  // 공통 코드 중 plantcode 를 헤더 로 조회
      setDropDownItemPlantCode(data);
      if (data.length > 0) {
        const defaultPlant = data[0];
        setValue("plantcode", defaultPlant.value);
        setPlantCode(defaultPlant);
      }
    };
    loadOptions();
  }, [apiUrl]);

  // 사용자 그룹
  const [ usergroup, setUserGroup ] = useState(null);
  const [dropDownItemusergroup, setDropDownItemUserGroup] = useState("");
  // 사용자그룹 데이터 받아오기
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, {param1 : 'common', param2 : '1000', param3 : 'usergroup', param4: "X"});
      setDropDownItemUserGroup(data);
      if (data.length > 0 ){
        const defaultUser = data[0];
        setValue("usergroup", defaultUser.value);
        setUserGroup(defaultUser);
      }
    };
    loadOptions();
  }, [apiUrl]);

  /////////////////////////////////////////////////////////////// 필수 입력 컬럼 및 backend 로 보내기 위한 파라매터들
  const methods = useForm({
    // yup을 통해 입력값 유효성 검사 설정 (plantcode, isuserid, usergroup, password 는 필수 항목)
    resolver: yupResolver(
      yup.object({
        isuserid: yup.string().required("사용자 ID를 입력하세요"), // userid는 필수 입력 필드
        password: yup.string().required("패스워드를 입력하세요."), // menutitle은 필수 입력 필드
      })
    ),
    // 입력 필드의 초기값 설정
    defaultValues: {
      plantcode: null, // 사업장 초기값
      isuserid: "", // 사용자 ID 초기값
      username: "", // 사용자명 초기값
      usergroup: null, //사용자 그룹 초기값
      password:"", // Password 초기값
      email: "", // Eamil 초기값
      phone:"", // 연락처 초기값
      useflag: true, // 사용여부 초기값 (true: 사용함)
    },
  });

  const {
    register, // input 필드와 useForm을 연결해주는 함수
    handleSubmit, // submit 시 호출되는 함수, 유효성 검사 후 실행됨
    formState: { errors }, // 각 필드의 에러 정보
    reset, // 텍스트 박스 을 초기화
    setValue, // 특정 필드의 값을 직접 설정할 수 있는 함수
  } = methods;

  
  /////////////////////////////////////////////////////////////// 저장 버튼 클릭 시 데이터 베이스 등록
  const onSubmit = async (data) => {
    const requestData = {
      ...data,
      // backend 로 보내기 위한 추가 파라매터
      useflag: chkuseflag ? "Y" : "N",
      userid: JSON.parse(localStorage.getItem("userid")), // 등록자 필수
    };

    try {
      const response = await axios.post(
        `${apiUrl}sys/usermaster-c`,
        JSON.stringify(requestData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const { jhedher } = response.data;
      setMessage(jhedher?.db_msg); // 정상적으로등록 되었습니다. / 동일한 코드 가 이미 존재 합니다.
      // 3초 후 메시지 제거
      setTimeout(() => {
        setMessage("");
      }, 3000);

      if (jhedher?.status === "S") {
        reset();
        if (dropDownItemplantCode.length > 0 ) {
          const defaultPlant = dropDownItemplantCode[0];
          setPlantCode(defaultPlant);
          setValue("plantcode", defaultPlant.value);
        }
        if (dropDownItemusergroup.length > 0) {
          const defaultUser = dropDownItemusergroup[0];
          setUserGroup(defaultUser);
          setValue("usergroup", defaultUser.value);
        }
        setExcuteSuccesAndSearch((prev) => !prev); // 저장 완료 후 재조회 실행
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    if (dropDownItemplantCode.length > 0 ) {
      const defaultPlant = dropDownItemplantCode[0];
      setPlantCode(defaultPlant);
      setValue("plantcode", defaultPlant.value);
    }
    if (dropDownItemusergroup.length > 0) {
      const defaultUser = dropDownItemusergroup[0];
      setUserGroup(defaultUser);
      setValue("usergroup", defaultUser.value);
    }
    setMessage(""); // 메시지 초기화
  };

  //////////////////////////////////////////////////////////////// 화면 디자인
  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)} // Validation 설정
      title="메뉴 등록"
      width="w-[700px]"
      height="h-[750px]"
      message={message} // 메시지 전달
    >
      <FormProvider {...methods}>
        <form className="space-y-4">
          <Auto_SearchDropDown
            label="사업장"
            onChange={(item) => {
              setValue("plantcode", item.value);
              setPlantCode(item);
            }}
            inputWidth="550px"
            horizontal
            dropDownData={dropDownItemplantCode}
            name="plantcode"
            labelSpacing="mr-4"
          />
          <Auto_Label_Text_Set
            label="사용자ID"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="isuserid"
            error={errors.isuserid}
            register={register}
          />
          <Auto_Label_Text_Set
            label="사용자명"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="username"
            error={errors.username}
            register={register}
          />
          <Auto_SearchDropDown
            label="사용자 그룹"
            onChange={(item) => {
              setValue("usergroup", item.value);
              setUserGroup(item);
            }}
            inputWidth="550px"
            horizontal
            dropDownData={dropDownItemusergroup}
            name="usergroup"
            labelSpacing="mr-4"
          />
          <Auto_Label_Text_Set
            label="Password"
            inputWidth="550px"
            labelSpacing="mr-7"
            name="password"
            error={errors.password}
            register={register}
          />
          <Auto_Label_Text_Set
            label="Email"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="email"
            register={register}
          />
          <Auto_Label_Text_Set
            label="연락처"
            inputWidth="550px"
            labelSpacing="mr-12"
            name="phone"
            register={register}
          />
          <Auto_Checkbox
            label="사용여부"
            value={chkuseflag}
            labelSpacing="ml-10"
            name="useflag"
            onChange={(e) => {
              const newValue = e.target.checked;
              setChkuseflag(newValue);
              setValue("useflag", newValue);
            }}
            register={register}
          />
        </form>
      </FormProvider>
    </Auto_SaveCloseModal>
  );
};

export default ModalCommonCodesGroupAdd;