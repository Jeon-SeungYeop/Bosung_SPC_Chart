import React, { useState, useEffect } from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form"; // FormProvider added
import { Auto_Label_Text_Set, Auto_Checkbox, DropDownItemGetter, Auto_SearchDropDown } from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";

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
  const [plantcode, setPlantCode] = useState(null);
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

  // 메뉴타입
  const [ menutype, setMenuType ] = useState(null);
  const [dropDownItemmenuType, setDropDownItemMenuType] = useState("");

  // 메뉴타입 데이터 받아오기
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, {param1 : 'common', param2 : '1000', param3 : 'menutype', param4: "X"});
      setDropDownItemMenuType(data);
      if (data.length > 0) {
        const defaultMenu = data[0];
        setValue("menutype", defaultMenu.value);
        setMenuType(defaultMenu);
      }
    };

    loadOptions();
  }, [apiUrl]);
  /////////////////////////////////////////////////////////////// 필수 입력 컬럼 및 backend 로 보내기 위한 파라매터들
  const methods = useForm({
    // yup을 통해 입력값 유효성 검사 설정 (menuid, menutype, menutitle, plantcode, manuname 는 필수 항목)
    resolver: yupResolver(
      yup.object({
        menuid: yup.string().required("Menu ID를 입력하세요"), // menuid는 필수 입력 필드
        menuname: yup.string().required("MenuName을 입력하세요."), // menuname은 필수 입력 필드
        menutitle: yup.string().required("MenuTitle을 입력하세요."), // menutitle은 필수 입력 필드
      })
    ),
    // 입력 필드의 초기값 설정
    defaultValues: {
      plantcode: "", // 사업장 초기값
      menuid: "", // 메뉴 ID 초기값
      menuname: "", // 메뉴명 초기값
      menutitle: "", //메뉴제목 초기값
      menutype: "", //메뉴타입 초기값
      url:"", // URL 초기값
      remark: "", // 비고 초기값
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
        `${apiUrl}sys/programmenu-c`,
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
        if (dropDownItemmenuType.length > 0 ) {
          const defaultMenu = dropDownItemmenuType[0];
          setMenuType(defaultMenu);
          setValue("menutype", defaultMenu.value);
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
    if (dropDownItemmenuType.length > 0 ) {
      const defaultMenu = dropDownItemmenuType[0];
      setMenuType(defaultMenu);
      setValue("menutype", defaultMenu.value);
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
      height="h-[680px]"
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
            label="메뉴ID"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="menuid"
            error={errors.menuid}
            register={register}
          />
          <Auto_Label_Text_Set
            label="메뉴명"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="menuname"
            error={errors.menuname}
            register={register}
          />
          <Auto_Label_Text_Set
            label="메뉴제목"
            inputWidth="550px"
            labelSpacing="mr-7"
            name="menutitle"
            error={errors.menutitle}
            register={register}
          />
          <Auto_SearchDropDown
            label= "메뉴타입"
            onChange={(item) => {
              setValue("menutype", item.value);
              setMenuType(item);
            }}
            inputWidth="550px" // 선택 박스 크기
            horizontal={true}   // 라벨 과 의 위치 true : 나란히
            dropDownData={dropDownItemmenuType} // 미리 조회 한 데이터 를 전달
            name="menutype"
            labelSpacing="mr-4"
          />
          <Auto_Label_Text_Set
            label="URL"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="url"
            register={register}
          />
          <Auto_Label_Text_Set
            label="비고"
            inputWidth="550px"
            labelSpacing="mr-12"
            name="remark"
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