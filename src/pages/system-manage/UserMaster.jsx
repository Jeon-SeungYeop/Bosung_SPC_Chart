import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_POPWorkerMaster, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Button_Export_Excel,
  Auto_Button_Import_Excel, Auto_Grid_Password_AGgrid, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";
import useUserStore from "@/services/store/userStore";
ModuleRegistry.registerModules([AllCommunityModule]);

const UserMaster = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "isuserid"]; // 그리드 의 기본 키
  const [enterSearch, setEnterSearch] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    isuserid: "",
    username: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "sys/usermaster-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        isuserid: searchParams.isuserid ?? "",
        username: searchParams.username ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );
  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    usergroup: { items: [], mappings: {} },
  });
  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, usergroupAll] =
          await Promise.all([  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "usergroup" }),
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          usergroup: { items: usergroupAll, mappings: CommonFunction.convertData(usergroupAll) },
        });
      } catch (error) {
      }
    };

    loadDropdownData();
  }, [apiUrl]);

  // 비동기 이미지 로딩 컴포넌트
  const UserIconCellRenderer = (value) => {
    const [imgSrc, setImgSrc] = useState('');
    const { currentUserId, setProfileIcon } = useUserStore.getState();

    const fileInputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
      const fetchImage = async () => {
        await CommonFunction.fetchAndSetImgSrc({
          apiUrl,
          searchinfo: {
            params: {
              plantcode: value.data.plantcode,
              getimagetype: "USERIMAGE",
              code: value.data.isuserid,
              seq: 1
            },
            address: "filemanage/getimage_r",
          },
          setImgSrc: setImgSrc
        });
      }
      fetchImage();
    }, [value]);

    // 파일 선택 처리
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const previewURL = URL.createObjectURL(file);
        setImgSrc(previewURL);

        // 현재 로그인한 userid와 row의 userid가 같으면 바로 profileIcon 변경
        if ('"' + value.data.isuserid + '"' === currentUserId) {
          setProfileIcon(previewURL);
        }

        // 파일 저장
        await handleSaveClick(value.data, previewURL, file);
      }
    };

    // 파일 저장하기
    const handleSaveClick = async (data, imageSrc, file) => {
      // blob:http://localhost:5173/604a7ead-d24b-4ccf-b41c-f30c4e1a44cc

      try {
        // blob URL을 fetch하여 실제 Blob 데이터 획득
        const response = await fetch(imageSrc);
        const blob = await response.blob();

        // FormData 생성 및 Blob 추가
        const formData = new FormData();

        formData.append("plantcode", data.plantcode);
        formData.append("getimagetype", "USERIMAGE");
        formData.append("code", data.isuserid);
        formData.append("seq", "1");  // 프로필 사진은 하나만
        formData.append("file", blob, file.name); // 실제 Blob 데이터  
        formData.append("userid", JSON.parse(localStorage.getItem("userid")));

        try {
          // 서버로 업로드 요청
          const uploadResponse = await fetch(`${apiUrl}filemanage/getimage_u`, {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            console.log("프로필 사진 변경 완료");
          } else {
            console.log("프로필 사진 변경 실패");
          }

        } catch (error) {
          console.log("프로필 사진 변경 실패");
        }

      } catch (err) {
        console.log("저장 오류");
      }
    };

    // 셀 클릭 이벤트 - icon 변경
    useEffect(() => {
      const handleClick = () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      };

      const node = containerRef.current;
      if (node) {
        node.addEventListener('click', handleClick);
      }

      return () => {
        if (node) {
          node.removeEventListener('click', handleClick);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center cursor-pointer"
      >
        <img
          src={imgSrc ? imgSrc : ""}
          alt=""
          className="w-10 h-10 object-cover rounded-full cursor-pointer"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  // 그리드 컬럼 정의
  const columnDefs = useMemo(
    () => [
      {
        field: "plantcode",
        headerName: "사업장",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.plantcode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.plantcode.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능. 
        minWidth: 150,
      },
      // {
      //   headerName: "작업자ID",
      //   field: "workerid",
      //   // 그리드 셀 에  팝업 을 활성화시키는 버튼을 세팅 
      //   cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} isDark={isDark} setisPopupOpen={setIsWorkerPopupOpen} />),
      // },
      { field: "isuserid", headerName: "사용자ID", editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), minWidth: 150,}, // 신규 추가 일 경우 만 수정가능 
      { field: "username", headerName: "사용자명", editable: true, minWidth: 110, },
      {
        field: "usergroup",
        headerName: "그룹",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.usergroup.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.usergroup.mappings[params.value],
        minWidth: 140,
      },
      {
        field: "password",
        headerName: "Password",
        editable: false,
        cellRenderer: (params) => (<Auto_Grid_Password_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        //cellEditor : Auto_Grid_Password_AGgrid,        // cellRender로 사용 시 editable은 false로, cellEditor로 사용 시 editable은 true로, 컴포넌트 input classname에 pl-[15px] 추가
        //valueFormatter: () => "******", // 비밀번호는 화면에 *로 표시, cellEditor로 할 경우 주석 해제
        minWidth: 140,
      },
      { field: "email", headerName: "Email", editable: true, minWidth: 150,},
      { field: "phone", headerName: "연락처", editable: true, minWidth: 130, },
      {
        field: "usericon", headerName: "프로필 아이콘",
        cellRenderer: UserIconCellRenderer,
        minWidth: 110,
      },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { field: "rowstatus", headerName: "상태", hide: true },
    ],
    [dropdownData]
  );

  return (
    <div className="space-y-5"> 
      <TitleBar title="사용자 관리" />
      {/* 조회부 */}
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
                labelSpacing={'-mr-3'}
              />
              <Auto_Label_Text_Set
                label="사용자ID"
                value={searchParams.isuserid}
                onChange={(e) => updateSearchParams("isuserid", e.target.value)}
                labelSpacing={'-mr-5'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="사용자명"
                value={searchParams.username}
                onChange={(e) => updateSearchParams("username", e.target.value)}
                labelSpacing={'-mr-5'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Radio_Useflag
                useValue={searchParams.useflag}
                setUseValue={(value) => updateSearchParams("useflag", value)}
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
              enterSearch={enterSearch}
              setEnterSearch={setEnterSearch}
              setAddData={setAddData}
            />
          </div>
        </div>
      </Card>
      {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
        <Loading />
      ) : (
        <Card noborder>
          <div className="flex justify-between">
            <div className="flex space-x-2 mb-5">
              <Auto_Button_Import_Excel
                columnDefs={columnDefs}
                setGridData={setGridData}
              />
              <Auto_Button_Export_Excel
                columnDefs={columnDefs}
                gridData={gridData}
                title={"사용자 관리"}
              />
              <Auto_Button_Column_State
                columnDefs={columnDefs}
                gridRef={gridRef}
              />
            </div>
            <div className="flex space-x-2 mb-5">
              <Auto_Button_Add_AGgrid
                // setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                columnDefs={columnDefs}
                gridRef={gridRef}
                setAddData={setAddData}
              />
              <Auto_Button_Delete_AGgrid
                gridRef={gridRef}
                gridData={gridData}
                setAddData={setAddData}
              />
              <Auto_Button_Save_AGgrid
                modifiedData={[...gridData, ...addData]}
                modifyAddress="sys/usermaster-cud"
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                gridRef={gridRef}
              />
            </div>
          </div>
          <Auto_AgGrid
            gridType="recipient" // 데이터를 전달받아 처리하는 그리드
            primaryKeys={primaryKeys}
            gridData={gridData}
            gridRef={gridRef}
            columnDefs={columnDefs}
            originalDataRef={originalDataRef}
            dropdownData={dropdownData}
          />
        </Card>
      )}
    </div>
  )
};

export default UserMaster;
