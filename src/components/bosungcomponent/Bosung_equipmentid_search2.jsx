import React, { useState, useEffect, useMemo, useRef } from "react";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";
import Card from "@/components/ui/Card";
import axios from "axios";
import {
    Auto_Button_Search,
    Auto_Label_Text_Set,
    Auto_Radio_Useflag,
    TitleBar,
    Auto_SearchDropDown,
    DropDownItemGetter,
    Auto_Button_Search_AGgrid,
    CommonFunction
} from "@/components/autocomponent";
///////////////////////////////////////// 사업장 , 동, 설비 //////////////////////////////////////////////////
const Bosung_equipmentid_search2 = ({setGridData, searchAdress, excuteSuccesAndSearch}) => {
    const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
    const [addData, setAddData] = useState([]); // 추가 대상 리스트
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const primaryKeys = ["plantcode", "groupid", "parentmenuid", "menuid"]; // 그리드의 기본 키
    
    const apiUrl = useApiUrl();
    // 검색 조건 
    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        sitecode: "",
        equipmentid: "",
    });

    // 검색조건 변경 즉시 반영 (setSearchParams 이후 선언할 것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const searchinfo = useMemo(
        () => ({
            address: searchAdress,
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                sitecode: searchParams.sitecode?.value ?? "",
                equipmentid: searchParams.equipmentid?.value ?? "",
            },
        }),
        [searchParams]
    );

    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        sitecode: { items: [], mappings: {} },
        equipmentid: { items: [], mappings: {} },
    });

    // 드롭다운 데이터 로드 (plantcode, sitecode)
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, sitecodeAll, ] = await Promise.all([
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }), // 조회부 콤보박스
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }), // 그리드 콤보박스 (필수 선택)
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }),
                ]);

                setDropdownData((prev) => ({
                    ...prev,
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
                    sitecode: { items: sitecodeAll, mappings: CommonFunction.convertData(sitecodeAll) },
                }));
            } catch (error) {
                console.error("드롭다운 데이터 로드 실패:", error);
            }
        };

        loadDropdownData();
    }, [apiUrl]);

    // equipmentid 드롭다운 데이터 로드 (process 및 sitecode 값에 의존)
    useEffect(() => {
        const loadEquipmentData = async () => {
            if (!searchParams.sitecode?.value) {
                //sitecode 값이 없으면 equipmentid 데이터를 초기화
                setDropdownData((prev) => ({
                    ...prev,
                    equipmentid: { items: [], mappings: {} },
                }));
                return;
            }

            try {
                const equipmentAll = await DropDownItemGetter(apiUrl, {
                    param1: "FactoryPerEquip",
                    param2: "1000",
                    param3: searchParams.sitecode.value,
                    //param4: "X",
                    param5: "OP002"
                });

                setDropdownData((prev) => ({
                    ...prev,
                    equipmentid: {
                        items: equipmentAll,
                        mappings: CommonFunction.convertData(equipmentAll),
                    },
                }));
            } catch (error) {
                console.error("설비 데이터 로드 실패:", error);
                setDropdownData((prev) => ({
                    ...prev,
                    equipmentid: { items: [], mappings: {} },
                }));
            }
        };

        loadEquipmentData();
    }, [apiUrl, searchParams.sitecode?.value]);

    return (
        <>
            <Card noborder>
                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
                            <Auto_SearchDropDown
                                label="사업장"
                                id="plantcode" // 로그인 사용자 사업장 기본 선택
                                onChange={(item) => updateSearchParams("plantcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.plantcode.items}
                                labelSpacing={'mr-0'}
                            />
                            <Auto_SearchDropDown
                                label="동"
                                id="sitecode"
                                onChange={(item) => updateSearchParams("sitecode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.sitecode.items}
                                labelSpacing={'mr-0'}
                            />
                            <Auto_SearchDropDown
                                label="설비"
                                id="equipment"
                                onChange={(item) => updateSearchParams("equipmentid", item)}
                                inputWidth="270px"
                                horizontal
                                dropDownData={dropdownData.equipmentid.items}
                                labelSpacing={'mr-0'}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end h-full">
                        <Auto_Button_Search_AGgrid
                            searchinfo={searchinfo}
                            setGridData={setGridData}
                            excuteSuccesAndSearch={excuteSuccesAndSearch}
                            originalDataRef={originalDataRef} // 변경 데이터 참조용 원본 데이터 복사 Map
                            primaryKeys={primaryKeys} // 복사 세트를 만들 Key 정보 
                            setAddData={setAddData}
                        />
                    </div>
                </div>
            </Card>
        </>
    )
};

export default Bosung_equipmentid_search2;