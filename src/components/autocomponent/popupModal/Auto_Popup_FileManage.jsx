import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import Auto_SaveCloseModal from "@/components/autocomponent/common/Auto_SaveCloseModal";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import Icon from "@/components/ui/Icon";
import {
  Auto_AgGrid,
  CommonFunction,
} from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext";

const Auto_Popup_FileManage = ({
  getimagetype,
  selectedRowData,
  activeModal,
  onClose,
  title,
  keyword = "", // worker : 작업자 마스터
  selectdPopupInfo,
  icon1 = "heroicons-outline:plus-sm",
  icon3 = "heroicons-outline:minus-sm",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  iconPosition = "left",
  iconClass = "text-lg",
}) => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 

  const [message, setMessage] = useState("");

  // 이미지 미리보기 URL 상태
  const [imageSrc, setImageSrc] = useState(null);
  // 추가한 file 상태
  const [addedFile, setAddedFile] = useState(null)
  // 다운로드 파일 URL, DATA 상태
  const [downFileSrc, setDownFileSrc] = useState(null);
  const [downloadData, setDownloadData] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      //selectdPopupInfo 초기화
      Object.keys(selectdPopupInfo.current).forEach((key) => {
        selectdPopupInfo.current[key] = "";
      });
    };

    // 화면 Open 과 동시 조회
    loadOptions().then(() => {
      setTimeout(() => {
        afterSearchButtonClick();
      }, 10);
    });
  }, [apiUrl]);

  // 바로 조회
  const afterSearchButtonClick = async () => {
    const searchinfo = {
      address: "filemanage/getimagetogrid_r",
      params: {
        plantcode: selectedRowData.plantcode ? selectedRowData.plantcode : "", // 사업장 
        getimagetype: getimagetype,  // 이미지 를 가져올 종류 * Equipmemtn : 설비이미지, COMMONGROUP : 공통코드 그룹 등록
        code: selectedRowData.code ? selectedRowData.code : "", // 코드
      },
    };
    await CommonFunction.fetchAndSetGridData({
      apiUrl,
      searchinfo,
      setGridData,
    });
  };

  useEffect(() => {
    if (downFileSrc && downloadData) {
      // 다운로드 함수 실행
      downloadImage(downFileSrc, downloadData.filename);

      // 초기화
      setDownFileSrc(null);
      setDownloadData(null);
    }
  }, [downFileSrc, downloadData]);

  // 파일 다운로드 버튼 클릭
  const onClickDownload = useCallback(async (event, data) => {
    try {
      setDownloadData(data);
      await CommonFunction.fetchAndSetImgSrc({
        apiUrl,
        searchinfo: {
          params: {
            plantcode: selectedRowData.plantcode ? selectedRowData.plantcode : "", // 사업장 
            getimagetype: getimagetype,  // 이미지 를 가져올 종류 * Equipmemtn : 설비이미지, COMMONGROUP : 공통코드 그룹 등록
            code: selectedRowData.code ? selectedRowData.code : "", // 코드
            seq: data.seq,
          },
          address: "filemanage/getimage_r",
        },
        setImgSrc: setDownFileSrc
      });

    } catch (error) {
      console.log("error", error);
      saveMessage.current = "다운로드에 실패하였습니다.";
      setIsModalOpen(true);
    }

  }, []);

  // 다운로드 실행
  const downloadImage = async (fileUrl, filename) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // 임시로 a태그 만들고 -> 다운로드하고 -> 지우기
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const columnDefs = useMemo(
    () => [
      { field: "seq", headerName: "순번", maxWidth: 80, cellClass: "text-center" },
      { field: "filesize", headerName: "파일크기" },
      { field: "filename", headerName: "파일명" },
      { field: "makedate", headerName: "등록일자" },
      { field: "maker", headerName: "등록자명" },
      {
        field: "download", headerName: "다운로드",
        cellRenderer: (params) => (<Button className="bg-primary-500 text-white h-8" text="Download" onClick={(e) => onClickDownload(e, params.data)} />)
      }
    ],
    []
  );

  const getSearchinfoGroup = () => ({
    params: {
      plantcode: selectedRowData.plantcode ? selectedRowData.plantcode : "", // 사업장 
      getimagetype: getimagetype,  // 이미지 를 가져올 종류 * Equipmemtn : 설비이미지, COMMONGROUP : 공통코드 그룹 등록
      code: selectedRowData.code ? selectedRowData.code : "", // 코드
    }
  });

  // 숨겨진 파일 입력 ref
  const fileInputRef = useRef(null);

  // 파일 선택창 열기
  const handleLoadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 파일 선택 후 처리
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setAddedFile(file);
    }
    // 같은 파일을 연속 선택해도 이벤트가 발생하도록 초기화
    e.target.value = "";
  }, []);

  useEffect(() => {
    if (addedFile) {
      handleSaveClick(); // addedFile 설정된 후 실행
    }
  }, [addedFile]); // addedFile 바뀔 때만 실행

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);


  // blob URL → Blob 객체 → FormData → POST 전송
  const saveMessage = useRef(""); // 데이터 베이스 전송 결과 메세지

  // 파일 저장하기
  const handleSaveClick = async () => {
    // blob:http://localhost:5173/604a7ead-d24b-4ccf-b41c-f30c4e1a44cc

    try {
      // blob URL을 fetch하여 실제 Blob 데이터 획득
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      const searchinfo = getSearchinfoGroup(); // 함수 호출로 객체 생성

      // FormData 생성 및 Blob 추가
      const formData = new FormData();

      formData.append("plantcode", searchinfo.params.plantcode);
      formData.append("getimagetype", searchinfo.params.getimagetype);
      formData.append("code", searchinfo.params.code);
      formData.append("seq", "0");  // 코어에서 자동채번
      formData.append("file", blob, addedFile.name); // 실제 Blob 데이터  
      formData.append("userid", JSON.parse(localStorage.getItem("userid")));

      try {
        // 서버로 업로드 요청
        const uploadResponse = await fetch(`${apiUrl}filemanage/getimage_u`, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          saveMessage.current = "저장이 완료 되었습니다.";
          setIsModalOpen(true); // 저장 이 완료 되었습니다.
          afterSearchButtonClick();  // 재조회
        } else {
          saveMessage.current = "저장을 실패하였습니다.";
          setIsModalOpen(true); // 저장에 실패 하였습니다.
        }

      } catch (error) {
        console.log("error", error);
        saveMessage.current = "저장을 실패하였습니다.";
        setIsModalOpen(true); // 저장에 실패 하였습니다.
      }

    } catch (err) {
      saveMessage.current = "저장 중 오류가 발생하였습니다.담당자 에게 문의하세요";
      setIsModalOpen(true); // 저장 중 에러가 발생하였습니다.
    }
    setAddedFile(null);

  };

  // 파일 삭제하기
  const handleDeleteClick = async () => {
    try {
      // 그리드에서 선택된 행 가져오기
      const selectedRows = gridRef.current?.api.getSelectedRows();
      if (!selectedRows || selectedRows.length === 0) {
        saveMessage.current = "선택된 데이터가 없습니다.";
        setIsModalOpen(true);
        return;
      }

      const searchinfo = getSearchinfoGroup(); // 함수 호출로 객체 생성

      const newData = selectedRows.map(item => ({
        plantcode: searchinfo.params.plantcode,
        getimagetype: searchinfo.params.getimagetype,
        code: searchinfo.params.code,
        seq: item?.seq ?? null, // item이 제대로 되어 있는지도 확인
      }));

      // 서버로 업로드 요청
      const uploadResponse = await fetch(`${apiUrl}filemanage/getimagetogrid_d`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(newData),
      });

      if (uploadResponse.ok) {
        saveMessage.current = "정상적으로 삭제 되었습니다.";
        setIsModalOpen(true);
        setImageSrc(null);
        afterSearchButtonClick();  // 재조회
      } else {
        saveMessage.current = "삭제를 실패하였습니다.";
        setIsModalOpen(true);
      }
    } catch (err) {
      saveMessage.current = "삭제 중 오류가 발생하였습니다.담당자 에게 문의하세요";
      setIsModalOpen(true);
    }

  };

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);   // 저장 완료 modal state

  // 저장완료 Modal Cancel
  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  // 닫힘버튼 이벤트
  const onCloseFunction = () => {
    const fileCnt = gridRef.current?.api.getRenderedNodes().length;
    selectdPopupInfo.current = { fileCount: fileCnt };
    onClose();
  };
  
  // ESC키 입력 시 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onCloseFunction();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onCloseFunction]);

  return (
    <>
      {/* 확인만 있는 모달 (저장완료 경우) */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleModalCancel} // 닫힘 버튼 클릭 액션
          title="파일 갱신" // title 
          message={saveMessage.current} // 메시지
          answertype="OK"  // 확인 버튼 . 
        />
      )}
      <Auto_SaveCloseModal
        activeModal={activeModal}
        onClose={onCloseFunction}
        title={`${title} 정보 조회`}
        width="w-[950px]"
        height={window.innerHeight - 300} // 창 크기에 맞춰 조절(grid는 window.innerHeight - 500)
        message={message}
        buttonHide={true}
      >
        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          accept="*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="flex justify-end mb-4 space-x-4">
          {/* 이미지 불러오기 버튼 */}
          <button
            type="button"
            onClick={handleLoadClick}
            className={`btn ${className} group
              bg-[#F1F5F9] text-[#141412] dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg`}
          >
            <span className="flex items-center">
              {icon1 && (
                <span
                  className={`
                    transition-transform duration-300 ease-in-out group-hover:scale-150
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon1} />
                </span>
              )}
              <span>파일추가</span>
            </span>
          </button>

          {/* 이미지 삭제하기 버튼 */}
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`btn ${className} group
              bg-[#F1F5F9] text-[#141412] dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg`}
          >
            <span className="flex items-center">
              {icon3 && (
                <span
                  className={`
                    transition-transform duration-300 ease-in-out group-hover:scale-150
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon3} />
                </span>
              )}
              <span>파일삭제</span>
            </span>
          </button>
        </div>
        <Auto_AgGrid
          gridType="recipient"
          gridRef={gridRef}
          gridData={gridData}
          columnDefs={columnDefs}
        />
      </Auto_SaveCloseModal>
    </>
  );
};

export default Auto_Popup_FileManage; 