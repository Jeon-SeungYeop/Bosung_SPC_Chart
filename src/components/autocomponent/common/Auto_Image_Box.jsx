import Icon from "@/components/ui/Icon";
import { React, useCallback, useState, useEffect, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import useDarkMode from "@/services/hooks/useDarkMode";
import { CommonFunction } from "@/components/autocomponent";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";

function Auto_Image_Box({
  icon1 = "heroicons-outline:plus-sm",
  icon2 = "heroicons-outline:photo",
  icon3 = "heroicons-outline:minus-sm",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  iconPosition = "left",
  iconClass = "text-lg",
  getSearchinfoEquipmentImage,
  isImageSearchPoint, // 이미지 조회 시점
}) {
  const apiUrl = useApiUrl();
  const [isDark] = useDarkMode(); //  isDark만 사용하고 싶을 때 
  // 이미지 미리보기 URL 상태
  const [imageSrc, setImageSrc] = useState(null);


  // 화면 배율에 맞게 그리드 높이를 자동 조절 
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 500);
  useEffect(() => {
    const handleResize = () => setGridHeight(window.innerHeight - 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { 
    searchImg();
  }, [isImageSearchPoint]);


  // 사업장 설비 코드 별 이미지 조회
  const searchImg = async () => {
    await CommonFunction.fetchAndSetImgSrc({
      apiUrl,
      searchinfo: {
        ...getSearchinfoEquipmentImage(),
        address: "filemanage/getimage_r",
      },
      setImgSrc: setImageSrc
    });
  };



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
    }
    // 같은 파일을 연속 선택해도 이벤트가 발생하도록 초기화
    e.target.value = "";
  }, []);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);



  // blob URL → Blob 객체 → FormData → POST 전송
  const saveMessage = useRef(""); // 데이터 베이스 전송 결과 메세지



  // 이미지 파일 저장하기
  const handleSaveClick = async () => {
    // blob:http://localhost:5173/604a7ead-d24b-4ccf-b41c-f30c4e1a44cc

    try {
      // blob URL을 fetch하여 실제 Blob 데이터 획득
      const response = await fetch(imageSrc);
      const blob = await response.blob();

      // FormData 생성 및 Blob 추가
      const formData = new FormData();
      const searchinfo = getSearchinfoEquipmentImage(); // 함수 호출로 객체 생성

      formData.append("plantcode", searchinfo.params.plantcode);
      formData.append("getimagetype", searchinfo.params.getimagetype);
      formData.append("code", searchinfo.params.code);
      formData.append("seq", searchinfo.params.seq);
      formData.append("file", blob, "image.png"); // 실제 Blob 데이터  
      formData.append("userid", JSON.parse(localStorage.getItem("userid")));

      // 서버로 업로드 요청
      const uploadResponse = await fetch(`${apiUrl}filemanage/getimage_u`, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        saveMessage.current = "저장이 완료 되었습니다.";
        setIsModalOpen(true); // 저장 이 완료 되었습니다.
      } else {
        saveMessage.current = "저장을 실패하였습니다.";
        setIsModalOpen(true); // 저장에 실패 하였습니다.
      }
    } catch (err) {
      saveMessage.current = "저장 중 오류가 발생하였습니다.담당자 에게 문의하세요";
      setIsModalOpen(true); // 저장 중 에러가 발생하였습니다.
    }

  };

  // 이미지 파일 삭제하기
  const handleDeleteClick =  async () => {
    try { 

      // FormData 생성 및 Blob 추가
      const formData = new FormData();
      const searchinfo = getSearchinfoEquipmentImage(); // 함수 호출로 객체 생성

      formData.append("plantcode", searchinfo.params.plantcode);
      formData.append("getimagetype", searchinfo.params.getimagetype);
      formData.append("code", searchinfo.params.code);
      formData.append("seq", searchinfo.params.seq); 

      // 서버로 업로드 요청
      const uploadResponse = await fetch(`${apiUrl}filemanage/getimage_d`, {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        saveMessage.current = "정상적으로 삭제 되었습니다.";
        setIsModalOpen(true); 
        setImageSrc(null);
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


  return (
    <>
      {/* 확인만 있는 모달 (저장완료 경우) */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleModalCancel} // 닫힘 버튼 클릭 액션
          title="이미지 갱신" // title 
          message={saveMessage.current} // 메시지
          answertype="OK"  // 확인 버튼 . 
        />
      )}

      <div className="w-full rounded-xl p-4 border " style={{ height: `${gridHeight}px `, borderColor: isDark ? "#454969" : undefined }}>
        {/* 숨겨진 파일 입력 */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* 이미지 미리보기 영역 */}
        <div className="w-full h-[90%] rounded-xl flex items-center justify-center  ">
          {imageSrc ? (
            <img
              className="w-full h-full p-2 object-contain"
              src={imageSrc}
            />
          ) : <div className={`w-full h-full flex items-center justify-center text-center ${isDark ? "" : "text-slate-700"} `}>
            조회된 이미지가 없습니다.
          </div>}
        </div>

        <div className="flex justify-center mt-2 space-x-4">
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
              <span>이미지 불러오기</span>
            </span>
          </button>

          {/* 이미지 저장하기 버튼 */}
          <button
            type="button"
            onClick={handleSaveClick}
            className={`btn ${className} group
              bg-[#F1F5F9] text-[#141412] dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg`}
          >
            <span className="flex items-center">
              {icon2 && (
                <span
                  className={`
                    transition-transform duration-300 ease-in-out group-hover:scale-150
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                    ${iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                    ${iconClass}
                  `}
                >
                  <Icon icon={icon2} />
                </span>
              )}
              <span>이미지 저장하기</span>
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
              <span>이미지 삭제하기</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Auto_Image_Box;
