import React, { useState, useEffect, useMemo, useRef } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import Mixed from "@/components/partials/widget/chart/Mixed";
import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_CodeName, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter, Auto_DateTimePickerF_T,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Add_GroupMenu
} from "@/components/autocomponent";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";
import { useApiUrl } from "@/context/APIContext";
import Card from "@/components/ui/Card";
import DonutChart2 from "@/components/partials/widget/chart/dount-chart2";

const Dashboard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const [gridData, setGridData] = useState([]); // 그리드에 셋팅할 데이터
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 갱신 후 실제 재조회 시그널 (Grid -> Search 로 신호 )
    const [isSearchFlag, setIsSearchFlag] = useState(false); // 재조회 시  삭제 체크 Item 및 수정 내역 item 삭제
    const apiUrl = useApiUrl();
    const gridRef = useRef(); // 
    const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
    const [addData, setAddData] = useState([]); // 추가 대상 리스트
    const primaryKeys_g2 = ["plantcode", "instrumentid", "calibrationid"]; // 그리드 2의 기본 키
    const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수
    // 검색 조건 
    const [searchParams, setSearchParams] = useState({
      plantcode: "",
      optype: "",
      equipmenttype: "",
      startdate: "",
      enddate: "",
    });
    // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    // 조회 조건 및 조회 정보 
    const searchinfo = useMemo(
      () => ({
        address: "sys/usergrouppermenulist-r",
        params: {
          plantcode: searchParams.plantcode?.value ?? "",
          optype: searchParams.optype?.value ?? "",
          equipmenttype: searchParams.equipmenttype ?? "",
          startdate: searchParams.startdate ?? "",
          enddate: searchParams.enddate ?? "",
        },
      }),
      [searchParams]
    );
    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
      plantcode: { items: [], mappings: {} },
      optype: { items: [], mappings: {} },
      equipmenttype: { items: [], mappings: {} },
    });
    // 드롭다운 데이터 로드
    useEffect(() => {
      const loadDropdownData = async () => {
        try {
          const [plantcodeAll, plantcodeRequired, optypeAll, equipmenttype] =
            await Promise.all([
              DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
              DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
              DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "optype" , param4: "X" }),
              DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "equipmenttype", param4: "X"  }),
            ]);

          // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
          // items : 조회부 콤보박스 
          // mappings : 그리드 콤보박스 
          setDropdownData({
            plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
            optype: { items: optypeAll, mappings: CommonFunction.convertData(optypeAll) },
            equipmenttype: { items: equipmenttype, mappings: CommonFunction.convertData(equipmenttype) },
          });
        } catch (error) {
        }
      };

      loadDropdownData();
    }, [apiUrl]);

    useEffect(() => {
            // 1분(60초)마다 페이지 상태를 리셋
            const interval = setInterval(() => {
               setCount((prev) => prev + 1);
            }, 10000); // 60000ms = 1분
        
            // 컴포넌트 언마운트 시 interval을 정리
            return () => clearInterval(interval);
          }, []);
    
    const load_ratio_mix = {
      label: "processdefectrate",
      labels: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
      ],
      datas: [
        {
          name: "변형",
          type: "column",    // 막대 : column    선 : line     영역 : area
           data: [
            6, 5, 5, 5, 5, 5, 4, 4, 4, 4,
            4, 4, 4, 4, 3, 3, 3, 3, 3, 3,
            3, 3, 2, 2, 2, 2, 2, 2, 1, 1
          ]
        },
        {
          name: "외관",
          type: "column",
          data: [
            8, 7, 7, 7, 6, 6, 6, 6, 6, 6,
            6, 6, 5, 5, 5, 5, 4, 4, 4, 4,
            4, 4, 3, 3, 3, 3, 2, 2, 2, 2
          ]
        },
        {
          name: "치수",
          type: "column",
          data: [
            6, 7, 6, 6, 6, 6, 6, 6, 6, 6,
            5, 5, 5, 5, 5, 5, 5, 5, 4, 4,
            3, 3, 4, 4, 3, 3, 3, 3, 3, 3
          ]
        },
        {
          name: "불량수량",
          type: "line",
          data: [
            20, 19, 18, 18, 17, 17, 16, 16, 16, 16,
            15, 15, 14, 14, 13, 13, 12, 12, 11, 11,
            10, 10, 9, 9, 8, 8, 7, 7, 6, 6
          ]
        },
      ]
    }

    const load_ratio_donut = {
      label: "load-ratio",
      series: [101, 141, 141],
      labels: ["변형", "외관", "치수"]
    }
    const gridColumns = useMemo(() => {
          const baseColumns = [
            {
              field: "time",
              headerName: "시간",
              editable: false,
              minWidth: 100,
              cellClass: 'text-center',
            },
          ];
    
          const labelColumns = load_ratio_mix.labels.map((label) => ({
            field: label.toString(),
            headername: label.toString(),
            editable: false,
            minWidth: 50,
            cellClass: 'text-right',
          }));
    
          return [...baseColumns, ...labelColumns];
        }, []);
        
    // griddata 변환 부분
    useEffect(() => {
      const transformedData = load_ratio_mix.datas.map((datas) => {
        const item = { time: datas.name };
        load_ratio_mix.labels.forEach((label, index) => {
          item[label.toString()] = datas.data[index];
        });
        return item;
      });
      setGridData(transformedData);
    }, []);
    
    return (
      <div className="space-y-5">
        <TitleBar title="공정 불량율" />
        <Card noborder>
          <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_SearchDropDown
                label="공장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.plantcode.items}
                labelSpacing={'mr-0'}
              />
              <Auto_SearchDropDown
                label="공정"
                onChange={(item) => updateSearchParams("optype", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.optype.items}
                labelSpacing={'mr-0'}
              />
              <Auto_SearchDropDown
                label="설비"
                onChange={(item) => updateSearchParams("equipmenttype", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.equipmenttype.items}
                labelSpacing={'mr-0'}
              />
              <Auto_DateTimePickerF_T
                label="조회기간"
                onChangeStart={(val) => updateSearchParams("startdate", val)}
                onChangeEnd={(val) => updateSearchParams("enddate", val)}
                labelSpacing=""
                isFirst={true}
              />
            </div>
            <div className="flex items-center justify-end h-full">
              <Auto_Button_Search_AGgrid
                searchinfo={searchinfo}
                setGridData={setGridData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                originalDataRef={originalDataRef} // 변경 데이터 참조용 원본 데이터 복사 Map
                primaryKeys={primaryKeys_g2} // 복사 세트를 만들 Key 정보 
                enterSearch={enterSearch}
                setEnterSearch={setEnterSearch}
                setAddData={setAddData}
              />
            </div>
          </div>
        </Card>
        <div className="flex w-full space-x-4">
          <Card noborder className="w-1/4">
            <DonutChart2 data = {load_ratio_donut} height={400}/>
          </Card>
          <Card noborder className="w-3/4">
            <Mixed data = {load_ratio_mix} height={400}/>
          </Card>
        </div>
        <div className="flex w-full space-x-4 ">
            <table className="bg-[#FFFFFF] w-[400px] rounded-xl">
              <tbody>
                <tr>
                  <td colSpan="2" className="text-center">KPI : 공정 불량율</td>
                </tr>
                <tr>
                  <td className="text-right w-2/5">생산수량 : </td>
                  <td className="text-center">7435162 EA</td>
                </tr>
                <tr>
                  <td className="text-right">불량수량 : </td>
                  <td className="text-center">383 EA</td>
                </tr>
                <tr>
                  <td className="text-right">공정불량율 : </td>
                  <td className="text-center">51.5 PPM</td>
                </tr>
                <tr>
                  <td className="text-right">목표 공정불량율 : </td>
                  <td className="text-center">50 PPM</td>
                </tr>
              </tbody>
            </table>
            <Auto_AgGrid
              gridType="sender" // 데이터를 전달받아 처리하는 그리드
              primaryKeys={primaryKeys_g2}
              gridData={gridData}
              gridRef={gridRef}
              columnDefs={gridColumns}
              originalDataRef={originalDataRef}
              dropdownData={dropdownData}
              height="222"
            />
        </div>
        <div className="h-10"></div>
      </div>
    );
  };
  
  export default Dashboard;
  