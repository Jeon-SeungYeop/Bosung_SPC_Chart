import React, { useState, useEffect } from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider, useWatch } from "react-hook-form"; // FormProvider added
import { Auto_Label_Text_Set, Auto_Checkbox, DropDownItemGetter, Auto_SearchDropDown, Auto_Label_Integer_Set } from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";

// setExcuteSuccesAndSearch : 메인그리드의 재조회 여부
const ModalInstrumentMasterAdd = ({
  activeModal,
  onClose,
  setExcuteSuccesAndSearch,
}) => {
  const apiUrl = useApiUrl();
  const [chkuseflag, setChkuseflag] = useState(true);
  const [message, setMessage] = useState(""); // 메시지 상태 추가
  const [calibrationcycle, setCalibrationcycle] = useState("");
  
  // 사업장
  const [ plantcode, setPlantCode ] = useState(null);
  const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]);

  // 사업장 그룹 데이터 받아오기
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1 : 'common' , param2 : '1000' , param3: "plantcode", param4: "X"});  // 공통 코드 중 plantcode 를 헤더 로 조회
      setDropDownItemPlantCode(data);
      if (data.length > 0) {
        const defaultPlant = data[0];
        setValue("plantcode", defaultPlant.value);
        setPlantCode(defaultPlant);
      }
    };

    loadOptions();
  }, [apiUrl]);

  // 관리등록
  const [ managegrade, setManageGrade ] = useState(null);
  const [dropDownItemmanageGrade, setDropDownItemManageGrade] = useState("");

  // 관리등록 데이터 받아오기
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, {param1 : 'common', param2 : '1000', param3 : 'insmangrade', param4: "X"});
      setDropDownItemManageGrade(data);
      if (data.length > 0){
        const defaultGrade = data[0];
        setValue("managegrade", defaultGrade.value);
        setManageGrade(defaultGrade);
      }
    };

    loadOptions();
  }, [apiUrl]);
  /////////////////////////////////////////////////////////////// 필수 입력 컬럼 및 backend 로 보내기 위한 파라매터들
  const methods = useForm({
    // yup을 통해 입력값 유효성 검사 설정 (menuid, menutype, menutitle, plantcode, manuname 는 필수 항목)
    resolver: yupResolver(
      yup.object({
        instrumentname: yup.string().required("계측기기 명을 입력하세요"), // instrumentname는 필수 입력 필드
        calibrationcycle : yup.string().required("검교정주기를 입력하세요."),
        purchasedate : yup.string().required("구입일을 입력하세요."),
        spec : yup.string().required("사양을 입력하세요"),
      })
    ),
    // 입력 필드의 초기값 설정
    defaultValues: {
      plantcode: "", // 사업장 초기값
      instrumentname: "", // 메뉴 ID 초기값
      calibrationcycle: "", // 메뉴명 초기값
      purchasedate: "", //메뉴제목 초기값
      managegrade: "", //메뉴타입 초기값
      spec:"", // URL 초기값
      manageemp: "", // 비고 초기값
      useflag: true, // 사용여부 초기값 (true: 사용함)
    },
  });

  const {
    register, // input 필드와 useForm을 연결해주는 함수
    handleSubmit, // submit 시 호출되는 함수, 유효성 검사 후 실행됨
    formState: { errors }, // 각 필드의 에러 정보
    reset, // 텍스트 박스 을 초기화
    setValue, // 특정 필드의 값을 직접 설정할 수 있는 함수
    watch,  // react-hook-form에서 현재 form 상태의 값을 실시간으로 감시
  } = methods;

  
  /////////////////////////////////////////////////////////////// 저장 버튼 클릭 시 데이터 베이스 등록
  const onSubmit = async (data) => {
    const requestData = {
      ...data,
      // backend 로 보내기 위한 추가 파라매터
      useflag: chkuseflag ? "Y" : "N",
      userid: JSON.parse(localStorage.getItem("userid")), // 등록자 필수
    };
    console.log(requestData);

    try {
      const response = await axios.post(
        `${apiUrl}baseinfo/measureequipmentmanster-c`,
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
        if (dropDownItemplantCode.length > 0) {
          const defaultPlant = dropDownItemplantCode[0];
          setPlantCode(defaultPlant);
          setValue("plantcode", defaultPlant.value);
        }
        if (dropDownItemmanageGrade.length > 0 ) {
          const defaultGrade = dropDownItemmanageGrade[0];
          setManageGrade(defaultGrade);
          setValue("managegrade", defaultGrade.value);
        }
        setCalibrationcycle("");
        setExcuteSuccesAndSearch((prev) => !prev); // 저장 완료 후 재조회 실행
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    if (dropDownItemplantCode.length > 0) {
      const defaultPlant = dropDownItemplantCode[0];
      setPlantCode(defaultPlant);
      setValue("plantcode", defaultPlant.value);
    }
    if (dropDownItemmanageGrade.length > 0 ) {
      const defaultGrade = dropDownItemmanageGrade[0];
      setManageGrade(defaultGrade);
      setValue("managegrade", defaultGrade.value);
    }
    setMessage(""); // 메시지 초기화
    setCalibrationcycle("");
  };

  //////////////////////////////////////////////////////////////// 화면 디자인
  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)} // Validation 설정
      title="계측기기 등록"
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
            label="계측기기 명"
            inputWidth="550px"
            labelSpacing="mr-3"
            name="instrumentname"
            error={errors.instrumentname}
            register={register}
          />
          <Auto_Label_Integer_Set
            label="검교정주기"
            inputWidth="550px"
            labelSpacing="mr-5"
            {...register("calibrationcycle")}    // Integer_Set의 Cleave Macthing 부분
            value={watch("calibrationcycle")}  // 저장시 필드값 초기화를 위한 value= watch 부분
            error={errors.calibrationcycle}
          />
          <Auto_Label_Text_Set
            label="구입일"
            inputWidth="550px"
            labelSpacing="mr-7"
            name="purchasedate"
            error={errors.purchasedate}
            register={register}
          />
          <Auto_Label_Text_Set
            label="사양"
            inputWidth="550px"
            labelSpacing="mr-7"
            name="spec"
            error={errors.spec}
            register={register}
          />
          <Auto_SearchDropDown
            label="관리등급"
            onChange={(item) => {
              setValue("managegrade", item.value);
              setManageGrade(item);
            }}
            inputWidth="550px"
            horizontal
            dropDownData={dropDownItemmanageGrade}
            name="managegrade"
            labelSpacing="mr-4"
          />
          <Auto_Label_Text_Set
            label="관리자"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="manageemp"
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

export default ModalInstrumentMasterAdd;