import React, { useState , useEffect} from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form"; // FormProvider added
import { Auto_Label_Text_Set, Auto_Checkbox ,
  Auto_SearchDropDown,
  DropDownItemGetter,
} from "@/components/autocomponent";
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

  /////////////////////////////////////////////////////////////// 필수 입력 컬럼 및 backend 로 보내기 위한 파라매터들
  const methods = useForm({
    // yup을 통해 입력값 유효성 검사 설정 (groupid는 필수 항목)
    resolver: yupResolver(
      yup.object({
        groupid: yup.string().nullable().required("그룹ID 를 입력하세요."), // menuid는 필수 입력 필드  
      })
    ),
    // 입력 필드의 초기값 설정
    defaultValues: {
      plantcode : "", // 사업장 코드 
      groupid: "", // 그룹 ID 초기값
      groupname: "", // 그룹명 초기값
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





    // 사업장 드롭박스   
    const [ plantcode, setPlantCode ] = useState(null);
    const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]);
  
    useEffect(() => {
      const loadOptions = async () => {
        const data = await DropDownItemGetter(apiUrl, { param1: 'common', param2: '1000', param3: "plantcode", param4: "X" });
        setDropDownItemPlantCode(data);
        if (data.length > 0) {
          const defaultPlant = data[0];
          setValue("plantcode", defaultPlant.value);
          setPlantCode(defaultPlant);
        }
      };
      loadOptions();
    }, [apiUrl]);

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
        `${apiUrl}baseinfo/commonCode-c`,
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
    setMessage(""); // 메시지 초기화
  };

  //////////////////////////////////////////////////////////////// 화면 디자인
  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)} // Validation 설정
      title="공통 코드 그룹 등록"
      width="w-[700px]"
      height="h-[550px]"
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
            label="그룹ID"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="groupid"
            error={errors.groupid}
            register={register}
          />
          <Auto_Label_Text_Set
            label="그룹명"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="groupname"
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
 