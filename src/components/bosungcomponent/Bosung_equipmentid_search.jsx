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
    CommonFunction,
    Auto_DateTimePickerF_T,
    Auto_YearPickerF_T,
    Auto_Radio_Division,
} from "@/components/autocomponent";
///////////////////////////////////////// 사업장 , 동, 공정, 설비, 날짜(isDate 인자값 추가), //////////////////////////////////////////////////isDate - 년월일 , isYear - 년도만
/////////////////////////////////// 동, 공정 전체 선택이 되는 컴포넌트는 search4 컴포넌트로////////////////////////////////////////////////////
const Bosung_equipmentid_search = ({
    adress,
    setGridData,
    excuteSuccesAndSearch,
    isDate,
    oneDate = false,
    isYear,
    isDivision,
    AllProcess,
    daily = false,
    weekly = false,
}) => {  // 공정만 전체 선택 시 AllProcess true로 사용
    const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
    const [addData, setAddData] = useState([]); // 추가 대상 리스트
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const primaryKeys = ["plantcode", "groupid", "parentmenuid", "menuid"]; // 그리드의 기본 키
    
    const apiUrl = useApiUrl();
    // 검색 조건 
    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        sitecode: "",
        process: "",
        equipmentid: "",
        startdate: "",
        enddate: "",
        division: "month",
    });

    // 검색조건 변경 즉시 반영 (setSearchParams 이후 선언할 것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const searchinfo = useMemo(
        () => ({
            address: adress,
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                sitecode: searchParams.sitecode?.value ?? "",
                process: searchParams.process?.value ?? "",
                equipmentid: searchParams.equipmentid?.value ?? "",
                startdate: searchParams.startdate ?? "",
                enddate: searchParams.enddate ?? "",
                division: searchParams.division ?? "",
            },
        }),
        [searchParams]
    );

    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        sitecode: { items: [], mappings: {} },
        process: { items: [], mappings: {} },
        equipmentid: { items: [], mappings: {} },
    });

    // 드롭다운 데이터 로드 (plantcode, sitecode, process)
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, sitecodeAll, processAll, processRequired] = await Promise.all([
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }), // 조회부 콤보박스
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }), // 그리드 콤보박스 (필수 선택)
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }),
                    DropDownItemGetter(apiUrl, { param1: "process", param2: "1000",  }),
                    DropDownItemGetter(apiUrl, { param1: "process", param2: "1000", param4: "X" }),
                ]);

                setDropdownData((prev) => ({
                    ...prev,
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
                    sitecode: { items: sitecodeAll, mappings: CommonFunction.convertData(sitecodeAll) },
                    process: { items: AllProcess ? processAll : processRequired, mappings: CommonFunction.convertData(AllProcess ? processAll : processRequired) },
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
            if (!searchParams.process?.value || !searchParams.sitecode?.value) {
                // process 또는 sitecode 값이 없으면 equipmentid 데이터를 초기화
                setDropdownData((prev) => ({
                    ...prev,
                    equipmentid: { items: [], mappings: {} },
                }));
                return;
            }

            try {
                const equipmentAll = await DropDownItemGetter(apiUrl, {
                    param1: "processperequip",
                    param2: "1000",
                    param3: searchParams.process.value,
                    //param4: "X",
                    param5: searchParams.sitecode.value,
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
    }, [apiUrl, searchParams.process?.value, searchParams.sitecode?.value]);

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
                                label="공정"
                                onChange={(item) => updateSearchParams("process", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.process.items}
                                labelSpacing={'mr-0'}
                            />
                            <Auto_SearchDropDown
                                label="설비"
                                onChange={(item) => updateSearchParams("equipmentid", item)}
                                inputWidth="270px"
                                horizontal
                                dropDownData={dropdownData.equipmentid.items}
                                labelSpacing={'mr-0'}
                            />
                            {isDate && (
                                <Auto_DateTimePickerF_T
                                    label="조회기간"
                                    onChangeStart={(val) => updateSearchParams("startdate", val)}
                                    onChangeEnd={(val) => updateSearchParams("enddate", val)}
                                    labelSpacing=""
                                    isFirst={true}
                                    oneDate={oneDate}
                                    daily={daily}
                                    weekly={weekly}
                                />
                            )}
                            {isYear && (
                                <Auto_YearPickerF_T
                                    label="조회연도"
                                    onChangeStart={(val) => updateSearchParams("startdate", val)}
                                    onChangeEnd={(val) => updateSearchParams("enddate", val)}
                                    labelSpacing=""
                                    isFirst={true}
                                    oneDate={oneDate}
                                />
                            )}
                            {isDivision && (
                                <Auto_Radio_Division
                                    useValue={searchParams.division}
                                    setUseValue={(value) => updateSearchParams("division", value)}
                                />
                            )}
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

export default Bosung_equipmentid_search;