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

interface Props {
  open?: boolean;
  title?: string;
  simple?: boolean;
  operationsAfterSuccess?: boolean;
  natsSubject?: string;
  isNatsConnectionLoading?: boolean;
  errorCtx?: {
    connectionError: string;
    onError: (msg?: string) => void;
  };
  successCtx?: {
    btnTitle?: string;
    isLoaderActive?: boolean;
    onSuccess: () => void;
    onSuccessBtnClick?: () => void;
  };
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  simple: true,
  title: "Nats title",
  natsSubject: "",
  isNatsConnectionLoading: false,
  errorCtx: undefined,
  successCtx: undefined,
  operationsAfterSuccess: true,
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
    logs: ["Establishing connection. Please wait..."],
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
      <div
        style="
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <div v-if="connectionError">
          <div class="task-cogs-icon">
            <i class="fa fa-times-circle has-text-danger fa-5x fa-fw"></i>
          </div>
          <div
            class="task-log"
            style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            "
          >
            <div class="task-title">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="m15.75 15l-6-6m0 6l6-6m7 3c0-5.523-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10s10-4.477 10-10"
                    color="currentColor"
                  />
                </svg>
              </span>
            </div>
            <h3 style="margin-top: 8px">Connection failed</h3>
            <p>{{ connectionError }}</p>
          </div>
        </div>
        <div
          v-else-if="isNatsConnectionLoading"
          class="is-justify-content-center"
        >
          <div
            :style="{ height: '100%' }"
            style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            "
            class="is-fullheight"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path
                    stroke-dasharray="16"
                    stroke-dashoffset="16"
                    d="M12 3c4.97 0 9 4.03 9 9"
                  >
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.3s"
                      values="16;0"
                    />
                    <animateTransform
                      attributeName="transform"
                      dur="1.5s"
                      repeatCount="indefinite"
                      type="rotate"
                      values="0 12 12;360 12 12"
                    />
                  </path>
                  <path
                    stroke-dasharray="64"
                    stroke-dashoffset="64"
                    stroke-opacity=".3"
                    d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                  >
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="1.2s"
                      values="64;0"
                    />
                  </path>
                </g>
              </svg>
            </span>
            <h3 style="margin-top: 8px">Loading your data...</h3>
            <p>Please hang on — this won’t take long.</p>
          </div>
        </div>
        <div v-else-if="simple">
          <div class="task-cogs-icon">
            <i class="fa fa-cog fa-spin fa-5x fa-fw"></i>
            <span class="is-flex is-flex-direction-column">
              <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
              <i class="fa fa-cog fa-spin fa-3x fa-bw"></i>
            </span>
          </div>
          <div
            class="task-log"
            style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            "
          >
            <p class="task-title">
              <span
                style="display: flex"
                v-if="activeTask?.status === 'Running'"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt -->
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  >
                    <path
                      stroke-dasharray="16"
                      stroke-dashoffset="16"
                      d="M12 3c4.97 0 9 4.03 9 9"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.3s"
                        values="16;0"
                      />
                      <animateTransform
                        attributeName="transform"
                        dur="1.5s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      />
                    </path>
                    <path
                      stroke-dasharray="64"
                      stroke-dashoffset="64"
                      stroke-opacity=".3"
                      d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="1.2s"
                        values="64;0"
                      />
                    </path>
                  </g>
                </svg>
              </span>

              <span v-else-if="activeTask?.status === 'Success'">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    color="currentColor"
                  >
                    <path
                      d="M17 3.338A9.95 9.95 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10q-.002-1.03-.2-2"
                    />
                    <path d="M8 12.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11" />
                  </g>
                </svg>
              </span>

              <span v-else-if="activeTask?.status === 'Failed'">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="m15.75 15l-6-6m0 6l6-6m7 3c0-5.523-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10s10-4.477 10-10"
                    color="currentColor"
                  />
                </svg>
              </span>
            </p>
            <h3 style="margin-top: 8px">
              {{ activeTask?.step }}
            </h3>
            <p>{{ activeTask?.logs[activeTask?.logs.length - 1] }}</p>
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <RcButton
        v-if="longRunningTaskStatus === `Success`"
        @click="
          () => {
            longRunningTaskStatus === 'Success'
              ? successCtx?.onSuccess()
              : errorCtx.onError();
          }
        "
        :disabled="
          longRunningTaskStatus !== 'Success' &&
          longRunningTaskStatus !== 'Failed'
        "
        >Close</RcButton
      >
    </template>
  </Dialog>
</template>
