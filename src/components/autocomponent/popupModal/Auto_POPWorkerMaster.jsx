import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import Auto_Button from "@/components/autocomponent/common/Auto_Button";
import Icon from "@/components/ui/Icon";
 

const Auto_POPWorkerMaster = ({
  activeModal,
  onClose,
  noFade,
  disableBackdrop,
  footerContent,
  centered,
  title = "Basic Modal",
  width="w-[500px]" ,// 가로
  height="h-[200px]", // 세로
  message, // 메시지를 받도록 추가 
}) => {
  const [loading, setLoading] = useState(false); // 로딩 서클 표시

  const onExcute = async () => {
    setLoading(true); // 로딩 서클 표시 시작
    try {
      await onSubmit(); // 부모에서 전달받은 함수 실행
      onClose(); // 비동기 대기 후 모달 닫힘.
    } catch (error) {
      console.error("Error executing onSubmit:", error);
    } finally {
      setLoading(false); // 완료 후 표시 종료
    }
  };

  return (
    <>
      <Transition appear show={activeModal} as={Fragment}>
        <Dialog as="div" className="relative z-[99999]" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter={noFade ? "" : "duration-300 ease-out"}
            enterFrom={noFade ? "" : "opacity-0"}
            enterTo={noFade ? "" : "opacity-100"}
            leave={noFade ? "" : "duration-200 ease-in"}
            leaveFrom={noFade ? "" : "opacity-100"}
            leaveTo={noFade ? "" : "opacity-0"}
          >
            {!disableBackdrop && (
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-filter backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()} // 배경 클릭 시 동작을 막음
              />
            )}
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={`flex min-h-full justify-center items-center text-center p-6 ${
                centered ? "items-center" : "items-start"
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter={noFade ? "" : "duration-300 ease-out"}
                enterFrom={noFade ? "" : "opacity-0 scale-95"}
                enterTo={noFade ? "" : "opacity-100 scale-100"}
                leave={noFade ? "" : "duration-200 ease-in"}
                leaveFrom={noFade ? "" : "opacity-100 scale-100"}
                leaveTo={noFade ? "" : "opacity-0 scale-95"}
              >
                <Dialog.Panel
                  className={`transform overflow-hidden rounded-md
                    bg-white dark:bg-slate-800 text-left align-middle shadow-xl transition-alll
                    ${width} ${height}`} // Apply dynamic width and height classes
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
                    <h2 className="text-base font-medium text-black dark:text-white">
                      {title}
                    </h2>
                    <Auto_Button
                      onClick={onClose}
                      className="text-[22px] transform transition-transform duration-200 hover:scale-150 px-[0]" 
                      disabled={loading}
                    >
                      <Icon icon="heroicons-outline:x" />
                    </Auto_Button>
                  </div>

                  {footerContent && (
                    <div className="px-4 py-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-700">
                      {footerContent}
                    </div>
                  )}
                  {/* 메시지 출력 영역 */}
                  {message && (
                    <div className={`px-6 py-6 text-lefte font-semibold  `}>
                      {message}
                    </div>
                  )}

                  {/* 버튼 그룹 */}
                  <div className=" flex justify-end  space-x-2  px-2  mt-[-5px]">
                    {/* 확인 버튼 */}
                    <Auto_Button
                      type="button" // button type을 "button"으로 변경하여 폼 제출을 방지
                      onClick={onClose} // 닫기 버튼 클릭 시 모달 닫기
                      className={`btn btn-dark h-min w-max text-sm font-normal flex items-center space-x-2 group 
                        ${loading ? "opacity-50 cursor-not-allowed" : ""}`} //처리 중일 때 비활성화 디자인
                      disabled={loading} // 처리중일때 비활성
                    >
                      <Icon
                        icon="heroicons-outline:x"
                        className="w-5 h-5 group-hover:scale-150 transform transition-transform duration-200" // group-hover로 버튼에 마우스 오버 시 아이콘 크기 증가
                      />
                      <span>확인</span> {/* 텍스트 */}
                    </Auto_Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Auto_POPWorkerMaster;
