export const dbObject = {
  kind: "Postgres",
  resource: "postgreses",
  chartName: "kubedbcom-postgres-editor-options",
};

export const machines: Record<
  string,
  {
    resources: {
      requests: {
        cpu: string;
        memory: string;
      };
      limits: {
        cpu: string;
        memory: string;
      };
    };
  }
> = {
  "db.t.micro": {
    resources: {
      requests: {
        cpu: "250m",
        memory: "512Mi",
      },
      limits: {
        cpu: "500m",
        memory: "1Gi",
      },
    },
  },
  "db.t.small": {
    resources: {
      requests: {
        cpu: "1",
        memory: "1Gi",
      },
      limits: {
        cpu: "2",
        memory: "2Gi",
      },
    },
  },
  "db.t.medium": {
    resources: {
      requests: {
        cpu: "1",
        memory: "2Gi",
      },
      limits: {
        cpu: "2",
        memory: "4Gi",
      },
    },
  },
  "db.t.large": {
    resources: {
      requests: {
        cpu: "1",
        memory: "4Gi",
      },
      limits: {
        cpu: "2",
        memory: "8Gi",
      },
    },
  },
  "db.t.xlarge": {
    resources: {
      requests: {
        cpu: "2",
        memory: "8Gi",
      },
      limits: {
        cpu: "4",
        memory: "16Gi",
      },
    },
  },
  "db.t.2xlarge": {
    resources: {
      requests: {
        cpu: "4",
        memory: "16Gi",
      },
      limits: {
        cpu: "8",
        memory: "32Gi",
      },
    },
  },
  "db.m.small": {
    resources: {
      requests: {
        cpu: "500m",
        memory: "912680550",
      },
      limits: {
        cpu: "1",
        memory: "1825361100",
      },
    },
  },
  "db.m.large": {
    resources: {
      requests: {
        cpu: "1",
        memory: "4Gi",
      },
      limits: {
        cpu: "2",
        memory: "8Gi",
      },
    },
  },
  "db.m.xlarge": {
    resources: {
      requests: {
        cpu: "2",
        memory: "8Gi",
      },
      limits: {
        cpu: "4",
        memory: "16Gi",
      },
    },
  },
  "db.m.2xlarge": {
    resources: {
      requests: {
        cpu: "4",
        memory: "16Gi",
      },
      limits: {
        cpu: "8",
        memory: "32Gi",
      },
    },
  },
  "db.m.4xlarge": {
    resources: {
      requests: {
        cpu: "8",
        memory: "32Gi",
      },
      limits: {
        cpu: "16",
        memory: "64Gi",
      },
    },
  },
  "db.m.8xlarge": {
    resources: {
      requests: {
        cpu: "16",
        memory: "64Gi",
      },
      limits: {
        cpu: "32",
        memory: "128Gi",
      },
    },
  },
  "db.m.12xlarge": {
    resources: {
      requests: {
        cpu: "24",
        memory: "96Gi",
      },
      limits: {
        cpu: "48",
        memory: "192Gi",
      },
    },
  },
  "db.m.16xlarge": {
    resources: {
      requests: {
        cpu: "32",
        memory: "128Gi",
      },
      limits: {
        cpu: "64",
        memory: "256Gi",
      },
    },
  },
  "db.m.24xlarge": {
    resources: {
      requests: {
        cpu: "48",
        memory: "192Gi",
      },
      limits: {
        cpu: "96",
        memory: "384Gi",
      },
    },
  },
  "db.r.large": {
    resources: {
      requests: {
        cpu: "1",
        memory: "8Gi",
      },
      limits: {
        cpu: "2",
        memory: "16Gi",
      },
    },
  },
  "db.r.xlarge": {
    resources: {
      requests: {
        cpu: "2",
        memory: "16Gi",
      },
      limits: {
        cpu: "4",
        memory: "32Gi",
      },
    },
  },
  "db.r.2xlarge": {
    resources: {
      requests: {
        cpu: "4",
        memory: "32Gi",
      },
      limits: {
        cpu: "8",
        memory: "64Gi",
      },
    },
  },
  "db.r.4xlarge": {
    resources: {
      requests: {
        cpu: "8",
        memory: "96Gi",
      },
      limits: {
        cpu: "16",
        memory: "192Gi",
      },
    },
  },
  "db.r.8xlarge": {
    resources: {
      requests: {
        cpu: "16",
        memory: "128Gi",
      },
      limits: {
        cpu: "32",
        memory: "256Gi",
      },
    },
  },
  "db.r.12xlarge": {
    resources: {
      requests: {
        cpu: "24",
        memory: "192Gi",
      },
      limits: {
        cpu: "48",
        memory: "384Gi",
      },
    },
  },
  "db.r.16xlarge": {
    resources: {
      requests: {
        cpu: "32",
        memory: "256Gi",
      },
      limits: {
        cpu: "64",
        memory: "512Gi",
      },
    },
  },
  "db.r.24xlarge": {
    resources: {
      requests: {
        cpu: "24",
        memory: "384Gi",
      },
      limits: {
        cpu: "96",
        memory: "768Gi",
      },
    },
  },
};

export const machineList = [
  "custom",
  "db.t.micro",
  "db.t.small",
  "db.t.medium",
  "db.t.large",
  "db.t.xlarge",
  "db.t.2xlarge",
  "db.m.small",
  "db.m.large",
  "db.m.xlarge",
  "db.m.2xlarge",
  "db.m.4xlarge",
  "db.m.8xlarge",
  "db.m.12xlarge",
  "db.m.16xlarge",
  "db.m.24xlarge",
  "db.r.large",
  "db.r.xlarge",
  "db.r.2xlarge",
  "db.r.4xlarge",
  "db.r.8xlarge",
  "db.r.12xlarge",
  "db.r.16xlarge",
  "db.r.24xlarge",
];

export const EDITOR_MODES = {
  EDIT_CODE: "EDIT_CODE",
  VIEW_CODE: "VIEW_CODE",
  DIFF_CODE: "DIFF_CODE",
};
