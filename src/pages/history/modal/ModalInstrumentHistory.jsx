import React, { useState, useEffect } from "react"; // Import useEffect
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { Auto_Label_Text_Set, Auto_Checkbox, Auto_SearchDropDown,
    DropDownItemGetter, Auto_DateTimePicker} from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";

const ModalCommonCodesGroupAdd = ({
  activeModal,
  onClose,
  setExcuteSuccesAndSearch,
  row,
}) => {
  const apiUrl = useApiUrl();
  const [chkuseflag, setChkuseflag] = useState(true);
  const [message, setMessage] = useState("");  
  // 실시일자
  const [txtconductDate, setTxtconductDate] = useState("");
 
  // 검/교정구분
  const [dropDownItemcalibrationtype, setDropDownItemCalibrationType] = useState([]);

  useEffect(() => {
      const loadOptions = async () => {
        // "NotAll" : 전체 조회 조건 지움.  선택 하도록 함. 
        const data = await DropDownItemGetter(apiUrl, { param1: 'common', param2: '1000', param3: "calibratype" ,param4 : "X"});
        setDropDownItemCalibrationType(data);
      };
      loadOptions();
    }, [apiUrl]); 

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        /*codeid: yup.string().required("상세코드를 입력하세요"),
        codename: yup.string().required("상세코드명을 입력하세요."),*/
      })
    ),
    defaultValues: {
      plantcode: "",
      instrumentid: "",
      calibrationtype: "",
      conductdate: "",
      workerid: "",
      remark: "",
      useflag: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  // useEffect를 사용하여 비활성화된 필드에 대한 초기 값을 설정
  useEffect(() => {
    if (row) {
      setValue("plantcode", row.plantname || "");
      setValue("instrumentid", "[" + row.instrumentid + "] " +  row.instrumentname || "");
      
    }
  }, [row, setValue]);

  const onSubmit = async (data) => {
    const requestData = {
      ...data,
      plantcode: row.plantcode || "",
      instrumentid: row.instrumentid || "", 
      calibrationtype: data.calibrationtype?.value || "C", // dropbox 사용시 지정, plantcode 값을 추출하여 requestData에 포함
      useflag: chkuseflag ? "Y" : "N",
      conductdate : txtconductDate ?? "" ,
      userid: JSON.parse(localStorage.getItem("userid")),
    }; 
    
    try {
      const response = await axios.post(
        `${apiUrl}history/instrumenthistory-c`,
        JSON.stringify(requestData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { jhedher } = response.data;
      setMessage(jhedher?.db_msg);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      
      if (jhedher?.status === "S") {
        reset();
        setExcuteSuccesAndSearch((prev) => !prev);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setMessage("");
    setValue("plantcode", row.plantname || "");    // modal창 종료시 선택된 row 값 유지
    setValue("instrumentid", row.instrumentid || "");    // modal창 종료시 선택된 row 값 유지
  };

  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="계측기 검/교정이력"
      width="w-[700px]"
      height="h-[650px]"
      message={message}
    >
      <FormProvider {...methods}>
        <form className="space-y-4">
          <Auto_Label_Text_Set
            label="사업장"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="plantcode"
            register={register}
            disabled={true}
            value={methods.getValues("plantcode")} // getValues를 사용하여 현재 값 표시
          />
          <Auto_Label_Text_Set
            label="계측기기 ID"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="instrumentid"
            register={register}
            disabled={true}
            value={methods.getValues("instrumentid")} // getValues를 사용하여 현재 값 표시
          />
          <Auto_SearchDropDown
            label= "검교정구분"
            onChange={(selectitem) => setValue("calibrationtype", selectitem)} // 선택한 데이터를 Formik의 값으로 설정
            inputWidth="550px" // 선택 박스 크기
            horizontal={true}   // 라벨 과 의 위치 true : 나란히
            dropDownData={dropDownItemcalibrationtype} // 미리 조회 한 데이터 를 전달
            name="calibrationtype"
            error={errors.calibrationtype}
          /> 

          <Auto_DateTimePicker
           label = "실시일자"
           onChangeDate={(val) => setTxtconductDate(val ||  "" )} 
           pickerwidth = "550px"
           /> 
 
          <Auto_Label_Text_Set
            label="작업자"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="workerid"
            register={register}
            error={errors.workerid}
          />
          <Auto_Label_Text_Set
            label="비고"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="remark"
            register={register}
          />
          <Auto_Checkbox
            label="사용여부"
            labelSpacing="ml-10"
            name="useflag"
            value={chkuseflag}
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