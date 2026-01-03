import React from "react";
import { useAtom } from "jotai";
import { FaPlus, FaCode, FaEye } from "react-icons/fa";
import { Modal } from "../shared/Modal.jsx";
import { useIPCSend } from "../core/hooks/useIPC.js";
import { ModalHeader } from "../components/ModalHeader.js";
import { Button } from "../components/Button.js";
import { HelpIcon } from "../components/HelpIcon.js";
import { activeSetIdAtom, activeTrackIdAtom } from "../core/state.js";
import { updateActiveSet } from "../core/utils.js";
import { getActiveSetTracks } from "../../shared/utils/setUtils.js";
import { HELP_TEXT } from "../../shared/helpText.js";

export const AddModuleModal = ({
  isOpen,
  onClose,
  trackIndex,
  userData,
  setUserData,
  predefinedModules,
  onCreateNewModule,
  onEditModule,
  mode = "add-to-track",
}) => {
  const sendToProjector = useIPCSend("dashboard-to-projector");

  const handleClose = () => {
    sendToProjector("clear-preview", {});
    onClose();
  };

  const modalTitle = (
    <>
      {mode === "add-to-track" ? "MODULE" : "MODULES"}
      <HelpIcon helpText={HELP_TEXT.modules} />
    </>
  );

  const [activeSetId] = useAtom(activeSetIdAtom);
  const [activeTrackId] = useAtom(activeTrackIdAtom);
  const tracks = getActiveSetTracks(userData, activeSetId);

  const effectiveTrackIndex =
    trackIndex !== null && trackIndex !== undefined
      ? trackIndex
      : mode === "manage-modules" && activeTrackId
      ? tracks.findIndex((t) => t.id === activeTrackId)
      : null;

  const track =
    effectiveTrackIndex !== null && effectiveTrackIndex !== -1
      ? tracks?.[effectiveTrackIndex]
      : null;

  if (mode === "add-to-track") {
    if (trackIndex === null || trackIndex === undefined) return null;
    if (!track || !track.modules) return null;
  }

  const handleAddToTrack = (module) => {
    if (!track || effectiveTrackIndex === null || effectiveTrackIndex === -1)
      return;
    sendToProjector("clear-preview", {});
    updateActiveSet(setUserData, activeSetId, (activeSet) => {
      const track = activeSet.tracks[effectiveTrackIndex];
      const instanceId = `inst_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      track.modules.push({
        id: instanceId,
        type: module.name,
      });
      const constructorMethods = module.methods
        .filter((m) => m.executeOnLoad)
        .map((m) => ({
          name: m.name,
          options: m?.options?.length
            ? m.options.map((opt) => ({
                name: opt.name,
                value: opt.defaultVal,
              }))
            : null,
        }));
      track.modulesData[instanceId] = {
        constructor: constructorMethods,
        methods: {},
      };
    });
    onClose();
  };

  const modulesByCategory = predefinedModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCloseHandler={handleClose}
      size="medium"
    >
      <ModalHeader title={modalTitle} onClose={handleClose} />

      <div className="p-6">
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category} className="mb-6 font-mono">
            <div className="mb-2">
              <div className="opacity-50 text-[11px] text-neutral-300">
                {category}:
              </div>

              <div className="pl-6 uppercase flex flex-col flex-wrap gap-2">
                {modules.map((module) => {
                  const handlePreview = () => {
                    const constructorMethods = module.methods
                      .filter((m) => m.executeOnLoad)
                      .map((m) => ({
                        name: m.name,
                        options: m?.options?.length
                          ? m.options.map((opt) => ({
                              name: opt.name,
                              value: opt.defaultVal,
                            }))
                          : null,
                      }));

                    const matrixMethod = module.methods.find(
                      (m) => m.name === "matrix"
                    );
                    const showMethod = module.methods.find(
                      (m) => m.name === "show"
                    );

                    const finalConstructorMethods = [...constructorMethods];

                    if (
                      matrixMethod &&
                      !finalConstructorMethods.some((m) => m.name === "matrix")
                    ) {
                      finalConstructorMethods.unshift({
                        name: "matrix",
                        options: matrixMethod?.options?.length
                          ? matrixMethod.options.map((opt) => ({
                              name: opt.name,
                              value: opt.defaultVal,
                            }))
                          : null,
                      });
                    }

                    if (
                      showMethod &&
                      !finalConstructorMethods.some((m) => m.name === "show")
                    ) {
                      finalConstructorMethods.push({
                        name: "show",
                        options: showMethod?.options?.length
                          ? showMethod.options.map((opt) => ({
                              name: opt.name,
                              value: opt.defaultVal,
                            }))
                          : null,
                      });
                    }

                    const previewData = {
                      type: "preview-module",
                      props: {
                        moduleName: module.name,
                        moduleData: {
                          constructor: finalConstructorMethods,
                          methods: {},
                        },
                      },
                    };

                    sendToProjector(previewData.type, previewData.props);
                  };

                  const handleClearPreview = () => {
                    sendToProjector("clear-preview", {});
                  };

                  return (
                    <div
                      key={module.name}
                      className="flex items-center gap-1 group"
                    >
                      <div className="font-mono text-[11px] text-neutral-300 uppercase flex-1">
                        {module.name}
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          onMouseEnter={handlePreview}
                          onMouseLeave={handleClearPreview}
                          className="cursor-default"
                        >
                          <div
                            title="Preview module"
                            className="cursor-help flex items-center text-neutral-400"
                          >
                            <FaEye />
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditModule(module.name);
                          }}
                          type="secondary"
                          icon={<FaCode />}
                          title="Edit code"
                          className="text-blue-500/75"
                        />
                        <Button
                          onClick={() => handleAddToTrack(module)}
                          type="secondary"
                          icon={<FaPlus />}
                          title={
                            track ? "Add to track" : "Select a track first"
                          }
                          disabled={!track}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
