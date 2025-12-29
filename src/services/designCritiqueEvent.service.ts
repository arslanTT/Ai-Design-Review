import Design from "../models/design.model.js";
import { generateAiResponse } from "./ai.llm.service.js";
import designCritiqueEventBus from "../config/designCritiqueEvent.config.js";
import { io } from "../index.js";

const processingQueue: Set<string> = new Set();

const callApiForCritique = async (designId: string) => {
  if (processingQueue.has(designId)) return;
  processingQueue.add(designId);

  try {
    const design = await Design.findById(designId);
    if (!design) {
      processingQueue.delete(designId);
      return;
    }

    // 1. Update status to Processing
    await Design.findByIdAndUpdate(designId, {
      status: "Processing",
      aiCritique: { status: "Processing", date: new Date() },
    });

    // 2. Call AI
    const aiResponse = await generateAiResponse(
      design.imageDetails.url,
      design.title,
      design.description
    );

    // 3. Handle Failure
    if (!aiResponse.success) {
      await Design.findByIdAndUpdate(designId, {
        status: "Failed",
        aiCritique: {
          text: `Critique generation failed: ${aiResponse.error}`,
          date: new Date(),
          status: "Failed",
        },
      });

      if (io) {
        io.to(designId).emit("critique:failed", {
          designId,
          error: aiResponse.error,
        });
      }
      return;
    }

    // 4. Handle Success
    const updatedDesign = await Design.findByIdAndUpdate(
      designId,
      {
        status: "Completed",
        aiCritique: {
          text: aiResponse.data!.critique,
          date: new Date(),
          status: "Completed",
        },
        // REMOVED: designId: null (This would cause an error as it's not a schema field)
      },
      { new: true }
    );

    // 5. Emit to Room
    if (io) {
      io.to(designId).emit("critique:completed", {
        designId,
        critique: aiResponse.data!.critique,
        status: "completed",
        timestamp: new Date().toISOString(),
        design: {
          _id: updatedDesign!._id,
          title: updatedDesign!.title,
          imageUrl: updatedDesign!.imageDetails.url,
        },
      });
      console.log(`✅ Broadcasted critique to room: ${designId}`);
    }
  } catch (error: any) {
    console.error(`Unexpected error:`, error);
    await Design.findByIdAndUpdate(designId, {
      status: "error",
      aiCritique: { text: "System Error", status: "error" },
    });
  } finally {
    processingQueue.delete(designId);
  }
};

const setupDesignCritiqueEvent = () => {
  designCritiqueEventBus.on("design:critique-event", (designId: string) => {
    callApiForCritique(designId);
  });
};

export { setupDesignCritiqueEvent, callApiForCritique };
// import Design, { type IDesign } from "../models/design.model.js";
// import { generateAiResponse } from "./ai.llm.service.js";
// import designCritiqueEventBus from "../config/designCritiqueEvent.config.js";
// import { io } from "../index.js";

// // Add queue for processing to handle multiple requests
// const processingQueue: Set<string> = new Set();

// const callApiForCritique = async (designId: string) => {
//   // Prevent duplicate processing
//   if (processingQueue.has(designId)) {
//     console.log(`Design ${designId} is already being processed`);
//     return;
//   }

//   processingQueue.add(designId);

//   try {
//     console.log(`Processing critique for design: ${designId}`);

//     const design = await Design.findById(designId);
//     if (!design) {
//       console.error(`Design document with ID ${designId} not found.`);
//       processingQueue.delete(designId);
//       return;
//     }

//     // Update status to "processing"
//     await Design.findByIdAndUpdate(designId, {
//       status: "Processing",
//       aiCritique: {
//         status: "Processing",
//         date: new Date(),
//       },
//     });

//     const clientSocketId = design.clientSocketId;

//     // Generate AI critique
//     const aiResponse = await generateAiResponse(
//       design.imageDetails.url,
//       design.title,
//       design.description
//     );

//     if (!aiResponse.success) {
//       console.error(
//         `Critique failed for Design ID ${designId}:`,
//         aiResponse.error
//       );

//       await Design.findByIdAndUpdate(designId, {
//         status: "Failed",
//         aiCritique: {
//           text: `Critique generation failed: ${aiResponse.error}`,
//           date: new Date(),
//           status: "Failed",
//         },
//       });

//       if (clientSocketId && io) {
//         io.to(clientSocketId).emit("critique:failed", {
//           designId,
//           error: aiResponse.error,
//           timestamp: new Date().toISOString(),
//         });
//       }

//       processingQueue.delete(designId);
//       return;
//     }

//     // Update design with successful critique
//     const updatedDesign = await Design.findByIdAndUpdate(
//       designId,
//       {
//         status: "Completed",
//         aiCritique: {
//           text: aiResponse.data!.critique,
//           date: new Date(),
//           status: "Completed",
//         },
//         // Clear clientSocketId after processing
//         clientSocketId: null,
//       },
//       { new: true } // Return the updated document
//     );

//     // Notify client via Socket.IO
//     if (clientSocketId && io) {
//       io.to(clientSocketId).emit("critique:completed", {
//         designId,
//         critique: aiResponse.data!.critique,
//         status: "completed",
//         timestamp: new Date().toISOString(),
//         design: {
//           _id: updatedDesign!._id,
//           title: updatedDesign!.title,
//           imageUrl: updatedDesign!.imageDetails.url,
//         },
//       });

//       console.log(
//         `Notified client ${clientSocketId} about completed critique for ${designId}`
//       );
//     } else {
//       console.warn(
//         `No socket ID or IO instance for design ${designId}. Critique generated but not pushed.`
//       );
//     }

//     console.log(`Successfully processed critique for design: ${designId}`);
//   } catch (error: any) {
//     console.error(`Unexpected error processing design ${designId}:`, error);

//     // Update design with error
//     await Design.findByIdAndUpdate(designId, {
//       status: "error",
//       aiCritique: {
//         text: "Unexpected error during critique generation",
//         date: new Date(),
//         status: "error",
//         error: error.message,
//       },
//     });
//   } finally {
//     processingQueue.delete(designId);
//   }
// };

// const setupDesignCritiqueEvent = () => {
//   designCritiqueEventBus.on("design:critique-event", (designId: string) => {
//     console.log(`Received critique event for design: ${designId}`);
//     callApiForCritique(designId);
//   });

//   console.log("Design critique event listener initialized");
// };

// export { setupDesignCritiqueEvent, callApiForCritique };
