import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import {
  MANUFACTURING_MODULE,
  MANUFACTURING_STAGES,
} from "../../../../../modules/manufacturing";

/**
 * GET /admin/work-orders/:id/stages
 * Get all stages for a work order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  try {
    const stages = await manufacturingService.listWorkOrderStages({
      work_order_id: id,
    });

    res.json({ stages, available_stages: MANUFACTURING_STAGES });
  } catch (error: any) {
    console.error("Error fetching stages:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch stages" });
  }
}

/**
 * POST /admin/work-orders/:id/stages
 * Move work order to next stage
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const { notes, assigned_to } = req.body as {
    notes?: string;
    assigned_to?: string;
  };

  try {
    // Get current work order
    const workOrder = await manufacturingService.retrieveWorkOrder(id);

    if (!workOrder) {
      res.status(404).json({ message: "Work order not found" });
      return;
    }

    // Get next stage
    const nextStage = manufacturingService.getNextStage(
      workOrder.current_stage,
    );

    if (!nextStage) {
      res.status(400).json({
        message: "Work order is already at the final stage",
        current_stage: workOrder.current_stage,
      });
      return;
    }

    // Try to complete the current stage if it exists
    const currentStageRecords = await manufacturingService.listWorkOrderStages({
      work_order_id: id,
      stage: workOrder.current_stage,
      status: "active",
    });

    if (currentStageRecords.length > 0 && currentStageRecords[0].id) {
      const stageId = currentStageRecords[0].id;
      console.log("Updating stage with ID:", stageId);

      // MedusaService update expects data object with ID included
      await manufacturingService.updateWorkOrderStages({
        id: stageId,
        status: "completed",
        completed_at: new Date(),
      });
    }

    // Create new stage record for the next stage
    const newStage = await manufacturingService.createWorkOrderStages({
      work_order_id: id,
      stage: nextStage,
      status: "active",
      started_at: new Date(),
      assigned_to,
      notes,
    });

    console.log("Created new stage:", newStage);

    // Update work order current stage - data object with ID included
    const isCompleted = nextStage === "ready_to_ship";
    await manufacturingService.updateWorkOrders({
      id: id,
      current_stage: nextStage,
      status: isCompleted ? "completed" : "in_progress",
      ...(isCompleted && { completed_at: new Date() }),
    });

    // Retrieve the updated work order to return
    const updatedWorkOrder = await manufacturingService.retrieveWorkOrder(id);

    res.json({
      work_order: updatedWorkOrder,
      previous_stage: workOrder.current_stage,
      current_stage: nextStage,
    });
  } catch (error: any) {
    console.error("Error advancing stage:", error);
    res.status(500).json({
      message: error.message || "Failed to advance stage",
      error: error.toString(),
    });
  }
}
