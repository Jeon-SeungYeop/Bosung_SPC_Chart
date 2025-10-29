import React, { useState ,useEffect , useRef} from "react";
import Icon from "@/components/ui/Icon"; 
import "cleave.js/dist/addons/cleave-phone.us";
import CommonFunction from "../common/CommonFunction";
import Auto_Popup_CodeName from "../popupModal/Auto_Popup_CodeName";
import { useApiUrl } from "@/context/APIContext"; 

const Auto_LabelPopup_Set = ({
    label,  // 라벨 Text
    labelwidth = "85px",
    horizontal = true,
    labelSpacing,
    pickerwidth = "200px",
    register,
    name,
    placeholder = "",
    options,
    onFocus,
    id, 
    readonly,
    disabled, 
    inputWidth = "100%", // 기본값은 220px로 설정, 사용자가 조정 가능
    className,
    searchinfo,
    setgridData, 
    keyword, // 팝업을 호출 할 keyword : worker(작업자마스터), process(공정마스터) , equipment(설비마스터)
    onChangeId, // Id Input 값 변경 시 화면으로 값 전달
    onChangeName, // Name Input 값 변경 시 화면으로 값 전달.
    hiddenSpacing="60px",     // 화면 크기가 줄었을때 간격 조절용
    setEnterSearch, // enter 키를 눌렀을때 조회되게 하기 위한 변수
    ...rest
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const apiUrl = useApiUrl(); 


     ///   조회부 팝업 관련 데이터 
     const [txtid, setTxtId] = useState("");
     const [txtName, setTxtName] = useState(""); 
     //  팝업 호출 후 받아올 데이터 
     const popupInfoRef = useRef({ code: "", name: "" }); 

    

    const onClick = async () => {
        // Id, Codename 를 조회 해서 데이터가 한건 있을경우 팝업을 호출하지 않고 곧바로 표기함.
        const searchinfo = {
            address: "popup/popupcaller-codename",
            params: {
                type: keyword,
                plantcode: JSON.parse(localStorage.getItem("plantcode"))?.value ?? "", // 로그인 한 사용자 의 사업장을 기본 적용 
                code: txtid ?? "",
                name: txtName ?? "",
            },
        };
        const result = await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo, 
            isreturnJson : true, // datagrid 를 받아오지 않고 Json 을 그대로 반환
        });
        // 데이터가 하나만 있을경우 code , name 를 자동 입력. 
        // 받아온 결과로 판단
        if (result?.length === 1) { 
            setTxtId(result[0].code);
            setTxtName(result[0].name); 
            onChangeId?.(result[0].code);
            onChangeName?.(result[0].name);
        } else {
            setIsModalOpen(true);
        }
    }; 
    // 엔터키 입력 처리
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setEnterSearch(true);
    }
  };
  
    return (
        <div className={`fromGroup flex flex-wrap items-center gap-y-1 ${className ? className : ""} `}>
            {isModalOpen && (
                <Auto_Popup_CodeName
                    activeModal={isModalOpen}
                    onClose={() =>  
                        { setIsModalOpen(false);
                            setTxtId(popupInfoRef.current.code);
                            setTxtName(popupInfoRef.current.name);
                            onChangeId?.(popupInfoRef.current.code);
                            onChangeName?.(popupInfoRef.current.name);
                        }}
                    title={label}
                    keyword={keyword} // worker : 작업자 마스터 , process : 공정마스터 , equipment : 설비마스터
                    selectdPopupInfo={popupInfoRef} 
                    value={txtid}
                    value2={txtName}
                />
            )}

            {label && (
                <label className={`capitalize items-center text-left text-base font-normal ${horizontal ? labelSpacing : ""} `} style={{ width: labelwidth }}>
                    {label}
                </label>
            )}

            {/* workerid */}
            <div className="flex items-center relative w-fit group h-[38px] mr-3" style={{ width: pickerwidth, }}>
                <input
                    type="text"
                    value={txtid}
                    className={`form-control py-2 `}
                    placeholder={placeholder}
                    readOnly={readonly}
                    disabled={disabled}
                    id={id}
                    onChange={e => {
                        setTxtId(e.target.value || "");
                        setTxtName(""); // ID 수동 입력 시 이름 초기화
                        onChangeId?.(e.target.value|| "");
                        onChangeName?.("");
                      }}
                    style={{ width: inputWidth }}
                    onKeyDown={handleKeyPress}
                />
                <div onClick={onClick} style={{ cursor: "pointer" }}>
                    {(
                        <Icon
                            icon="heroicons-outline:clipboard"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
                        />
                    )}
                </div>
            </div>

            {/* 줄바꿈 유도용 div */}
            <div className="block w-full md:hidden lg:hidden" style={{ height: 0 }} />

            {/* name */}
            <div className={`flex items-center relative w-fit group h-[38px] ml-[${hiddenSpacing}] md:ml-[15px] lg:-ml-[9px]`} style={{ width: pickerwidth, }}>
                <input
                    type="text"
                    value={txtName}
                    className={`form-control py-2 `}
                    placeholder={placeholder}
                    readOnly={readonly}
                    disabled={disabled}
                    id={id}
                    onChange={e => {
                        setTxtName(e.target.value || "");
                        setTxtId(""); // ID 수동 입력 시 이름 초기화
                        onChangeId?.("");
                        onChangeName?.(e.target.value|| "");
                      }}
                    style={{ width: inputWidth }}
                    onKeyDown={handleKeyPress}
                />
                {(
                    <div onClick={onClick} style={{ cursor: "pointer" }}>
                        <Icon
                            icon="heroicons-outline:clipboard"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default Auto_LabelPopup_Set;
