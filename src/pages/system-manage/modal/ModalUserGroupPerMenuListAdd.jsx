import React, { useState, useEffect, useMemo, useRef} from "react";
import axios from "axios";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import {
  Auto_Label_Text_Set,
  Auto_Checkbox,
  DropDownItemGetter,
  Auto_SearchDropDown,
  Auto_Card_Grid,
} from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";

const Modalusergroupmenuadd = ({
  activeModal,
  onClose,
  setExcuteSuccesAndSearch,
}) => {
  const apiUrl = useApiUrl();
  const [message, setMessage] = useState("");
  const [gridData, setGridData] = useState([]);
  const [isSearchFlag, setIsSearchFlag] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const beforeRowData = useRef([]);

  // 체크박스
  const [chkuseflag, setChkuseflag] = useState(true);
  const [chkmanageauth, setChkmanageauth] = useState(true);
  // 사업장
  const [plantcode, setPlantCode] = useState(null);
  const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]); // 조회부 dropdown
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" });
      setDropDownItemPlantCode(data);
      if (data.length > 0) {
        const defaultValue = data[0];
        setValue("plantcode", { value: defaultValue.value, label: defaultValue.label });
        setPlantCode(defaultValue);
      }
    };
    loadOptions();
  }, [apiUrl]);

  // 사용자 그룹
  const [groupid, setGroupId] = useState(null);
  const [dropDownItemusergroup, setDropDownItemUserGroup] = useState("");
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "usergroup", param4: "X" });
      setDropDownItemUserGroup(data);
      if (data.length > 0) {
        const defaultValue = data[0];
        setValue("groupid", { value: defaultValue.value, label: defaultValue.label });
        setGroupId(defaultValue);
      }
    };
    loadOptions();
  }, [apiUrl]);

  // 상위메뉴
  const [parentmenuid, setParentMenuId] = useState(null);
  const [dropDownparentmenuid, setDropDownParentmenuid] = useState("");
  useEffect(() => {
    const loadOptions = async () => {
      const data = await DropDownItemGetter(apiUrl, { param1: "menutype", param2: "1000", param3: "M", param4: "X" });
      setDropDownParentmenuid(data);
      if (data.length > 0) {
        const defaultValue = data[0];
        setValue("parentmenuid", { value: defaultValue.value, label: defaultValue.label });
        setParentMenuId(defaultValue);
      }
    };
    loadOptions();
  }, [apiUrl]);

  const methods = useForm({
    resolver: yupResolver(
      yup.object({
        /*plantcode: yup.object().nullable().test(
            "is-not-empty-object",
            "사업장을 선택하세요.",
            (value) => value !== null && value?.value !== ""
          ),
        groupid: yup.object().nullable().test(
            "is-not-empty-object",
            "사용자 그룹을 선택하세요.",
            (value) => value !== null && value?.value !== ""
          ),
        parentmenuid: yup.object().nullable().test(
            "is-not-empty-object",
            "상위메뉴를 선택하세요.",
            (value) => value !== null && value?.value !== ""
          ),*/
        menuid: yup.string().required("메뉴를 선택하세요."),
      })
    ),
    defaultValues: {
      plantcode: null,
      groupid: null,
      parentmenuid: null,
      menuid: "",
      menutitle: "",
      useflag: true,
      manageauth: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = methods;

  const watchPlantcode = watch("plantcode");
  const watchGroupid = watch("groupid");

  const onSubmit = async (data) => {
    const requestData = {
      menuid: selectedMenuId || "",
      useflag: chkuseflag ? "Y" : "N",
      manageauth: chkmanageauth ? "Y" : "N",
      plantcode: data.plantcode?.value || "",
      groupid: data.groupid?.value || "",
      parentmenuid: data.parentmenuid?.value || "",
      userid: JSON.parse(localStorage.getItem("userid")),
    };
    console.log(requestData);
    
    try {
      const response = await axios.post(
        `${apiUrl}sys/usergrouppermenulist-c`,
        JSON.stringify(requestData),
        { headers: { "Content-Type": "application/json" } }
      );

      const { jhedher } = response.data;
      setMessage(jhedher?.db_msg);

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
        if (dropDownItemusergroup.length > 0 ) {
          const defaultgroup = dropDownItemusergroup[0];
          setGroupId(defaultgroup);
          setValue("groupid", defaultgroup.value);
        }
        if (dropDownparentmenuid.length > 0) {
          const defaultMenu = dropDownparentmenuid[0];
          setParentMenuId(defaultMenu);
          setValue("parentmenuid", defaultMenu.value);
        } 
        
        setExcuteSuccesAndSearch((prev) => !prev);
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
    if (dropDownItemusergroup.length > 0 ) {
      const defaultgroup = dropDownItemusergroup[0];
      setGroupId(defaultgroup);
      setValue("groupid", defaultgroup.value);
    }
    if (dropDownparentmenuid.length > 0) {
      const defaultMenu = dropDownparentmenuid[0];
      setParentMenuId(defaultMenu);
      setValue("parentmenuid", defaultMenu.value);
    }
    setChkuseflag(true);
    setChkmanageauth(true);
    setMessage("");
    setSelectedMenuId("");

    };
  

  const gridColumns = useMemo(() => {
    if (dropDownparentmenuid.length === 0) return [];
    return [
      { 
        Header: "메뉴ID", 
        accessor: "menuid", 
        width: "100px", 
        textAlign: "left" 
      },
      { 
        Header: "메뉴명", 
        accessor: "menutitle", 
        width: "100px", 
        textAlign: "left" 
      },
      { 
        Header: "URL", 
        accessor: "url", 
        width: "100px", 
        textAlign: "left" 
      },
    ];
  }, [dropDownparentmenuid]);

  const onChangeSearch = async () => {
    const searchinfo = {
      address: "sys/usergrouppermenulist-m-r",
      params: {
        plantcode: plantcode === null ? "" : plantcode?.value ?? "",
        groupid: groupid === null ? "" : groupid?.value ?? "",
      },
    };

    if (!searchinfo.address) {
      console.error("API address is not set.");
      return;
    }

    try {
      const url = `${apiUrl}${searchinfo.address}`;
      const response = await axios.get(url, { params: searchinfo.params });

      if (!response?.data) {
        console.error("No server response data.");
        return;
      }

      const { jhedher, jbody } = response.data;

      if (jhedher?.status !== "S") {
        console.warn("The server returned an error response.", jhedher);
        return;
      }

      setGridData && setGridData(jbody);
      setIsSearchFlag((prev) => !prev);
    } catch (error) {
      console.error("Data lookup error:", error);
    }
  };

  useEffect(() => {
    onChangeSearch();
  }, [watchPlantcode, watchGroupid, apiUrl]);

  return (
    <Auto_SaveCloseModal
      activeModal={activeModal}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title="사용자 그룹 메뉴 등록"
      width="w-[700px]"
      height="h-[1000px]"
      message={message}
    >
      <FormProvider {...methods}>
        <form className="space-y-4">
          <Auto_SearchDropDown
            label="사업장"
            onChange={(selectitem) => {
              setValue("plantcode", selectitem);
              setPlantCode(selectitem);
            }}
            inputWidth="550px"
            horizontal={true}
            dropDownData={dropDownItemplantCode}
            name="plantcode"
            //error={errors.plantcode}
            value={methods.getValues("plantcode")}
          />
          <Auto_SearchDropDown
            label="사용자 그룹"
            onChange={(selectitem) => {
              setValue("groupid", selectitem);
              setGroupId(selectitem);
            }}
            inputWidth="550px"
            horizontal={true}
            dropDownData={dropDownItemusergroup}
            name="groupid"
            //error={errors.groupid}
            value={methods.getValues("groupid")}
          />
          <Auto_SearchDropDown
            label="상위메뉴"
            onChange={(selectitem) => {
              setValue("parentmenuid", selectitem);
              setParentMenuId(selectitem);
            }}
            inputWidth="550px"
            horizontal={true}
            dropDownData={dropDownparentmenuid}
            name="parentmenuid"
            //error={errors.parentmenuid}
            value={methods.getValues("parentmenuid")}
          />
          <Auto_Card_Grid
            gridInfo="메뉴 리스트"
            gridColumns={gridColumns}
            checkColumnShow={false}
            primarykey={["plantcode", "groupid", "parentmenuid"]}
            gridData={gridData}
            AddButtonModal={""}
            setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
            limitvirticalscroll={true}
            isSearchFlag={isSearchFlag}
            cardheight={'400px'}
            excuteButtonVisible={false}
            setSelectRow={(row) => {
              setSelectedMenuId(row.menuid);
              setValue("menuid", row.menuid);
            }}
            beforerowdata={beforeRowData}
            error={errors.menuid}
            isselectgrid={true} //추가
            isselection={0}
            pagerowcount={5}
          />
          <div className="flex space-x-10 justify-end mr-3">
            <Auto_Checkbox
              label="갱신권한"
              value={chkmanageauth}
              labelSpacing="ml-10"
              name="manageauth"
              onChange={(e) => {
                const newValue = e.target.checked;
                setChkmanageauth(newValue);
                setValue("manageauth", newValue);
              }}
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
          </div>
        </form>
      </FormProvider>
    </Auto_SaveCloseModal>
  );
};

export default Modalusergroupmenuadd;
