<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  watch,
  ref,
  Ref,
} from "vue";
import type { Task, TaskLog } from "../../types/types";
import { StringCodec } from "nats.ws";
import type { Subscription } from "nats.ws";
import Dialog from "@shell/components/Dialog.vue";
import RcButton from "@rancher/shell/rancher-components/RcButton/RcButton.vue";

defineEmits(["close"]);

interface Props {
  open?: boolean;
  title?: string;
  simple?: boolean;
  operationsAfterSuccess?: boolean;
  natsSubject?: string;
  isNatsConnectionLoading?: boolean;
  errorCtx?: {
    connectionError: string;
    onError: (msg: string) => void;
  };
  successCtx?: {
    btnTitle?: string;
    isLoaderActive?: boolean;
    onSuccess: () => void;
    onSuccessBtnClick?: () => void;
  };
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
  simple: true,
  title: "Nats title",
  natsSubject: "",
  isNatsConnectionLoading: false,
  errorCtx: undefined,
  successCtx: undefined,
  operationsAfterSuccess: false,
});

const connectionError = computed(() => props.errorCtx?.connectionError);
const currentInstance = getCurrentInstance();
const $nats = currentInstance?.appContext.config.globalProperties.$nc;
let subscription: Subscription;

const tasks: Ref<Array<Task>> = ref([
  {
    status: "Running",
    step: "Starting tasks",
    id: "starting-tasks",
    logs: ["..."],
  },
]);
const activeStepId: Ref<string> = ref("starting-tasks");
// to maintain stepId to stepIndex map
// to find active task faster
const idToStepIndex: Ref<Record<string, number>> = ref({ "starting-tasks": 0 });
const activeTask = computed(() => {
  const task = tasks.value[idToStepIndex.value[activeStepId.value]];
  if (task.status === "Success" && props.operationsAfterSuccess)
    task.logs.push("Loading latest resources...");
  return task;
});

function handleTaskLog(log: TaskLog) {
  if (log.step) {
    // log has a step
    // so add new task
    tasks.value.push({
      ...log,
      logs: [(log.msg && log.msg) || ""],
    });

    // recent pushed task index
    const latestStepIndex = tasks.value.length - 1;

    // map taskid to stepIndex
    idToStepIndex.value[log.id as string] = latestStepIndex;

    // update active step index for first task
    // or if current active step is in latest step
    if (
      latestStepIndex === 0 ||
      latestStepIndex === idToStepIndex.value[activeStepId.value] + 1
    ) {
      activeStepId.value = log.id as string;
    }
  } else {
    // get active task
    const task = tasks.value[idToStepIndex.value[log.id as string]];
    if (task) {
      task.status = log.status;
      if (log.status === "Failed") {
        task.logs.push(log.error || "");
        props.errorCtx?.onError(log?.error || "");
      } else {
        task.logs.push(log.msg || "");
      }
    }
  }
}

async function subscribeToChannel(channelId: string) {
  subscription = $nats?.subscribe(channelId);

  console.log("Started listening", channelId);

  if (subscription) {
    // listen to channel events
    //@ts-ignore
    for await (const msg of subscription) {
      // first message arrived
      // update the initial values
      if (activeStepId.value === "starting-tasks") {
        tasks.value = [];
        activeStepId.value = "";
        idToStepIndex.value = {};
      }

      console.log("Long Running Tasks Modal=>");
      console.log({ data: StringCodec().decode(msg.data) });
      const log: TaskLog = JSON.parse(StringCodec().decode(msg.data));
      console.log({ log });
      handleTaskLog(log);
    }
    console.log("Stopped listening", channelId);
    console.log("Closed Channel", channelId);
  }
}

watch(
  () => props.natsSubject,
  (n) => {
    if (n) {
      subscribeToChannel(n);
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (n) => {
    if (!n) {
      subscription && subscription.unsubscribe();
    }
  }
);
onBeforeUnmount(() => {
  subscription && subscription.unsubscribe();
});

const longRunningTaskStatus = computed(() => {
  let successTaskCount = 0;
  let failedTaskCount = 0;

  // get count of success and failed task
  tasks.value.forEach((task) => {
    if (task?.status === "Success") successTaskCount++;
    else if (task?.status === "Failed") failedTaskCount++;
  });

  if (tasks.value.length === 0) return "NotStarted";
  // if all the task has been successful
  else if (successTaskCount === tasks.value.length) {
    return "Success";
  }
  // if all the task has been completed and some tasks are failed
  else if (
    failedTaskCount &&
    successTaskCount + failedTaskCount === tasks.value.length
  ) {
    return "Failed";
  } else return "Pending";
});

// execute on success and on error functions
watch(longRunningTaskStatus, (n) => {
  if (n === "Success") {
    // props.successCtx?.onSuccess();
    console.log("Success");
  } else if (n === "Failed") {
    console.log("Failed");
    // props.errorCtx?.onError("Operation Failed");
  }
});
</script>

<template>
  <Dialog v-if="open" :name="title" :open="open" :title="title">
    <template #default>
      <div v-if="connectionError" class="task-simple-wrapper">
        <div class="task-cogs-icon">
          <i class="fa fa-times-circle has-text-danger fa-5x fa-fw"></i>
        </div>
        <div class="task-log">
          <span class="task-title">
            <i class="fa fa-times-circle mr-5 is-failed" />
            <span> Connection error </span>
          </span>
          <span>{{ connectionError }}</span>
        </div>
      </div>
      <div
        v-else-if="isNatsConnectionLoading"
        class="is-justify-content-center"
        :class="simple ? 'task-simple-wrapper' : 'task-complex-wrapper'"
      >
        <div :style="{ height: '100%' }" class="is-fullheight">Loading...</div>
      </div>
      <div v-else-if="simple" class="task-simple-wrapper">
        <div class="task-cogs-icon">
          <i class="fa fa-cog fa-spin fa-5x fa-fw"></i>
          <span class="is-flex is-flex-direction-column">
            <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
            <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
          </span>
        </div>
        <div class="task-log">
          <span class="task-title">
            <i
              v-if="activeTask?.status === 'Running'"
              class="fa fa-circle-o-notch fa-spin mr-5"
            />
            <i
              v-else-if="activeTask?.status === 'Success'"
              class="fa fa-check-circle mr-5 is-success"
            />
            <i
              v-else-if="activeTask?.status === 'Failed'"
              class="fa fa-times-circle mr-5 is-failed"
            />
            <span>
              {{ activeTask?.step }}
            </span>
          </span>
          <span>{{ activeTask?.logs[activeTask?.logs.length - 1] }}</span>
        </div>
      </div>
    </template>
    <!-- <template #buttons>
      <RcButton v-if="longRunningTaskStatus === 'Success'" @click=""
        >ok</RcButton
      >
      <RcButton v-if="longRunningTaskStatus === 'Failed'" @click=""
        >cancel</RcButton
      >
    </template> -->
  </Dialog>
</template>

<style scoped lang="scss">
.task-simple-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40vw;
  height: 40vh;

  .task-cogs-icon {
    width: 100%;
    height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    // color: $ac-primary;
  }

  .task-log {
    width: 100%;
    height: 30%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .task-title {
      span,
      i {
        font-size: 16px;
      }

      i {
        // color: $ac-primary;

        &.is-success {
          // color: $success;
        }

        &.is-failed {
          // color: $danger;
        }
      }

      font-weight: 500;
    }

    span {
      font-size: 14px;
    }
  }
}

.task-complex-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 60vw;
  height: 60vh;

  .task-list {
    width: 25%;
    max-height: calc(100vh - 260px);
    overflow-y: auto;
  }

  .task-log {
    width: 70%;
    height: 100%;
    border-radius: 0px;
    font-size: 13px;
  }
}
</style>
