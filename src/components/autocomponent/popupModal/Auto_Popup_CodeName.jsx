import React, { useState, useEffect, useMemo, useRef } from "react"; 
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import {
    Auto_Label_Text_Set,
    Auto_AgGrid,
    Auto_SearchDropDown,
    DropDownItemGetter,
    CommonFunction,
} from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";
import Icon from "@/components/ui/Icon";
import Loading from "@/components/Loading";


const Auto_Popup_CodeName = ({
    activeModal,
    onClose,
    title,
    keyword = "", // worker : 작업자 마스터
    selectdPopupInfo, 
    value, // 화면에서 받은 code
    value2, // 화면에서 받은 name  
}) => {
    const gridRef = useRef(null);
    const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터
    const [txtid, setTxtId] = useState("");
    const [txtname, setTxtName] = useState(""); 
    const [message, setMessage] = useState("");
    const apiUrl = useApiUrl();
    const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수
    const [plantcode, setPlantCode] = useState(""); // 사업장
    const [dropDownItemplantCode, setDropDownItemPlantCode] = useState([]); // 드롭다운 데이터

    useEffect(() => {
        const loadOptions = async () => {
          //selectdPopupInfo 초기화
          Object.keys(selectdPopupInfo.current).forEach((key) => {
            selectdPopupInfo.current[key] = "";
          });
          const data = await DropDownItemGetter(apiUrl, {
            param1: "common",
            param2: "1000",
            param3: "plantcode",
          }); 
          setDropDownItemPlantCode(data);
       
          // 화면 Open 과 동시 메인화면 Id , Name 정보 출력
          setTxtId(value ?? "");
          setTxtName(value2 ?? ""); 
        };
      
        // 화면 Open 과 동시 조회
        loadOptions().then(() => { 
          setTimeout(() => {
            afterSearchButtonClick(value,value2); 
          }, 10);
        });
      }, [apiUrl]);

    const methods = useForm({
        resolver: yupResolver(
            yup.object({})
        ),
        defaultValues: {
            plantcode: "",
            id: "",
            name: "",
            type: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = methods;

    // 바로 조회 
    const afterSearchButtonClick = async (code = txtid, name = txtname) => {
        const searchinfo = {
            address: "popup/popupcaller-codename",
            params: {
                type: keyword,
                plantcode: plantcode?.value ?? "",
                code: code ?? "",
                name: name ?? "",
            },
        }; 
        await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo,
            setGridData,
        });
    };

    const columnDefs = useMemo(
        () => [
            { field: "code", headerName: "코드" },
            { field: "name", headerName: "이름" },
            { field: "udc1", headerName: "UDC1" },
            { field: "udc2", headerName: "UDC2" },
            { field: "udc3", headerName: "UDC3" },
            { field: "udc4", headerName: "UDC4" },
        ],
        []
    );

    const afterMainGridSelect = async (event) => {
        const selectedRows = event.api.getSelectedRows();
        if (selectedRows.length === 0) return;

        selectdPopupInfo.current = { code: selectedRows[0].code,
            name: selectedRows[0].name,
            udc1: selectedRows[0].udc1,
            udc2: selectedRows[0].udc2,
            udc3: selectedRows[0].udc3,
            udc4: selectedRows[0].udc4,
             };
    };


    const afterMainGridDoubleClick = async (event) => {
        const selectedRows = event.api.getSelectedRows();
        if (selectedRows.length === 0) return;

        selectdPopupInfo.current = { code: selectedRows[0].code,
            name: selectedRows[0].name ,
            udc1: selectedRows[0].udc1,
            udc2: selectedRows[0].udc2,
            udc3: selectedRows[0].udc3,
            udc4: selectedRows[0].udc4,};
        // 화면 닫기 
        onClose();
    };


    const onSubmit = async () => {
        // 그리드에서 선택된 행 가져오기
        const selectedRows = gridRef.current?.api.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            setMessage("데이터를 선택해주세요.");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        // selectdPopupInfo에 선택된 값 세팅
        selectdPopupInfo.current = {
            code: selectedRows[0].code,
            name: selectedRows[0].name,
            udc1: selectedRows[0].udc1,
            udc2: selectedRows[0].udc2,
            udc3: selectedRows[0].udc3,
            udc4: selectedRows[0].udc4,
        };
        // 모달 닫기
        onClose();
    };

    // Label Text 에서 Enter키 입력 시 조회
    useEffect(() => {
        if (enterSearch) {
            afterSearchButtonClick(txtid, txtname);
            setEnterSearch(false);
        }
    }, [enterSearch, setEnterSearch]);

    // ESC키 입력 시 모달 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
            onClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    return (
        <Auto_SaveCloseModal
            activeModal={activeModal}
            onClose={onClose}
            onSubmit={onSubmit}
            title={`${title} 정보 조회`}
            width="w-[950px]" 
            height="h-[700px]"
            message={message}
        >
            {dropDownItemplantCode.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <Loading /> {/* 로딩 스피너 또는 컴포넌트 */}
                </div>
            ) : (
                <>
                    <div className="mt-[8px] flex">
                        <Auto_SearchDropDown
                            label="사업장"
                            id="plantcode"
                            onChange={(item) => {
                                setValue("plantcode", item.value);
                                setPlantCode(item);
                            }}
                            inputWidth="200px"
                            horizontal
                            dropDownData={dropDownItemplantCode}
                            name="plantcode"
                            labelSpacing="-mr-5"
                        />

                        <Auto_Label_Text_Set
                            label={`${title}`}
                            inputWidth="200px"
                            labelSpacing="ml-5 -mr-5"
                            value={txtid}
                            onChange={(e) => {
                                setTxtId(e.target.value || "");
                                setTxtName("");
                            }}
                            setEnterSearch={setEnterSearch}
                        />

                        <Auto_Label_Text_Set
                            inputWidth="200px"
                            value={txtname}
                            onChange={(e) => {
                                setTxtName(e.target.value || "");
                                setTxtId("");
                                }
                            }
                            setEnterSearch={setEnterSearch}
                        />

                        <div
                            className="group form-control flex flex-wrap items-center w-[100px] justify-center ml-12 h-[40px] mb-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => afterSearchButtonClick(txtid, txtname)}  
                        >
                            <span className="transition-transform duration-300 ease-in-out group-hover:scale-150 ltr:mr-2 rtl:ml-2 text-xl">
                                <Icon icon="heroicons-outline:search" />
                            </span>
                            <span className="text-base font-semibold">조회</span>
                        </div>
                    </div>

                    <Auto_AgGrid
                        gridRef={gridRef}
                        height="450"
                        gridType="sender"
                        gridData={gridData}
                        columnDefs={columnDefs}
                        afterSelectionChanged={afterMainGridSelect}
                        afterMainGridDoubleClick = {afterMainGridDoubleClick}
                    />
                </>
            )}
        </Auto_SaveCloseModal>
    );
};

export default Auto_Popup_CodeName; 