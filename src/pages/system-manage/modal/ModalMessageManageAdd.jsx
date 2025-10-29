import React, { useState, useEffect } from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { Auto_Label_Text_Set, Auto_Checkbox, Auto_SearchDropDown, DropDownItemGetter } from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";

const ModalCommonCodesGroupAdd = ({
  activeModal,
  onClose,
  setExcuteSuccesAndSearch,
}) => {
  const apiUrl = useApiUrl();
  const [message, setMessage] = useState("");

  // 사업장
  const [plantcode, setPlantCode] = useState(null);
  const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]);
  // 메시지 타입
  const [msgtype, setMsgType] = useState(null);
  const [dropDownItemmessageType, setDropDownItemMessageType] = useState([]);

  // plantcode dropdown 로드
  useEffect(() => {
    const loadPlantOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" });
      setDropDownItemPlantCode(data);
      if (data.length > 0) {
        const defaultPlant = data[0];
        setValue("plantcode", defaultPlant.value);
        setPlantCode(defaultPlant);
      }
    };
    loadPlantOptions();
  }, [apiUrl]);

  // msgtype dropdown 로드
  useEffect(() => {
    const loadMsgTypeOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1: 'common', param2: '1000', param3: "MESSAGETYPE", param4: "X" });
      setDropDownItemMessageType(data);
      if (data.length > 0) {
        const defaultType = data[0];
        setValue("msgtype", defaultType.value);
        setMsgType(defaultType);
      }
    };
    loadMsgTypeOptions();
  }, [apiUrl]);

  // form 설정
  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        lang: yup.string().required("Lang를 입력하세요."),
        message: yup.string().required("메시지를 입력하세요."),
      })
    ),
    defaultValues: {
      plantcode: "",
      lang: "KO",
      msgtype: "",
      message: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = methods;

  const onSubmit = async (data) => {
    const requestData = {
      ...data,
      userid: JSON.parse(localStorage.getItem("userid")),
    };
    try {
      const response = await axios.post(
        `${apiUrl}sys/messagemanage-c`,
        JSON.stringify(requestData),
        { headers: { "Content-Type": "application/json" } }
      );
      const { jhedher } = response.data;
      setMessage(jhedher?.db_msg);
      setTimeout(() => setMessage(""), 3000);
      if (jhedher?.status === "S") {
        reset();
        // plantcode 초기값
        if (dropDownItemplantCode.length > 0) {
          const defaultPlant = dropDownItemplantCode[0];
          setPlantCode(defaultPlant);
          setValue("plantcode", defaultPlant.value);
        }
        // msgtype 초기값
        if (dropDownItemmessageType.length > 0) {
          const defaultType = dropDownItemmessageType[0];
          setMsgType(defaultType);
          setValue("msgtype", defaultType.value);
        }
            setExcuteSuccesAndSearch(prev => !prev);
      }
    } catch (error) {
      setMessage("An unexpected error occurred.");
    }
  };

  const handleClose = () => {
    onClose();
    setMessage("");
    // form 초기화 + 기본값 재설정
    reset();
    // plantcode 초기값
    if (dropDownItemplantCode.length > 0) {
      const defaultPlant = dropDownItemplantCode[0];
      setPlantCode(defaultPlant);
      setValue("plantcode", defaultPlant.value);
    }
    // msgtype 초기값
    if (dropDownItemmessageType.length > 0) {
      const defaultType = dropDownItemmessageType[0];
      setMsgType(defaultType);
      setValue("msgtype", defaultType.value);
    }
  };

  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="메시지 등록"
      width="w-[700px]"
      height="h-[400px]"
      message={message}
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
            label="언어"
            inputWidth="550px"
            labelSpacing="mr-7"
            name="lang"
            error={errors.lang}
            register={register}
          />

          <Auto_SearchDropDown
            label="메시지타입"
            onChange={(item) => {
              setValue("msgtype", item.value);
              setMsgType(item);
            }}
            inputWidth="550px"
            horizontal
            dropDownData={dropDownItemmessageType}
            name="msgtype"
            labelSpacing="mr-4"
          />

          <Auto_Label_Text_Set
            label="메시지"
            inputWidth="550px"
            labelSpacing="mr-8"
            name="message"
            register={register}
            error={errors.message}
          />
        </form>
      </FormProvider>
    </Auto_SaveCloseModal>
  );
};

export default ModalCommonCodesGroupAdd;
