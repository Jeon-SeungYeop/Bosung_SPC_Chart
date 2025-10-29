import React, { useState, useEffect } from "react"; // Import useEffect
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { Auto_Label_Text_Set, Auto_Checkbox } from "@/components/autocomponent";
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

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        codeid: yup.string().required("상세코드를 입력하세요"),
        codename: yup.string().required("상세코드명을 입력하세요."),
      })
    ),
    defaultValues: {
      plantcode: "",
      groupid: "",
      codeid: "",
      codename: "",
      real1: "",
      real2: "",
      real3: "",
      real4: "",
      real5: "",
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
      setValue("groupid", row.groupid || "");
      
    }
  }, [row, setValue]);

  const onSubmit = async (data) => {
    const requestData = {
      ...data,
      useflag: chkuseflag ? "Y" : "N",
      userid: JSON.parse(localStorage.getItem("userid")),
      plantcode: row.plantcode || "",
    };
    console.log(requestData);
    
    try {
      const response = await axios.post(
        `${apiUrl}baseinfo/commoncodedesc-c`,
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
    setValue("groupid", row.groupid || "");    // modal창 종료시 선택된 row 값 유지
  };

  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="공통 코드 그룹 등록"
      width="w-[700px]"
      height="h-[800px]"
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
            label="그룹 ID"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="groupid"
            register={register}
            disabled={true}
            value={methods.getValues("groupid")} // getValues를 사용하여 현재 값 표시
          />
          <Auto_Label_Text_Set
            label="상세코드"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="codeid"
            register={register}
            error={errors.codeid}
          />
          <Auto_Label_Text_Set
            label="상세코드명"
            inputWidth="550px"
            labelSpacing="mr-3"
            name="codename"
            register={register}
            error={errors.codename}
          />
          <Auto_Label_Text_Set
            label="관련1"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="real1"
            register={register}
          />
          <Auto_Label_Text_Set
            label="관련2"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="real2"
            register={register}
          />
          <Auto_Label_Text_Set
            label="관련3"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="real3"
            register={register}
          />
          <Auto_Label_Text_Set
            label="관련4"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="real4"
            register={register}
          />
          <Auto_Label_Text_Set
            label="관련5"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="real5"
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