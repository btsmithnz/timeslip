import { FontAwesome6 } from "@expo/vector-icons";
import {
  useConvexAuth,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  InvoiceModal,
  type InvoiceModalSubmitValues,
} from "@/components/invoice/invoice-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/use-color-palette";
import { api } from "../../../../convex/_generated/api";

const PAGE_SIZE = 12;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export default function InvoicesScreen() {
  const palette = useColorPalette();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useConvexAuth();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const createInvoice = useMutation(api.invoices.create);
  const formOptions = useQuery(
    api.invoices.invoiceFormOptions,
    isAuthenticated ? {} : "skip",
  );
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.invoices.listPaginated,
    isAuthenticated ? {} : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const clients = formOptions?.clients ?? [];
  const projects = formOptions?.projects ?? [];

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        _id: String(client._id),
        name: client.name,
      })),
    [clients],
  );
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        _id: String(project._id),
        name: project.name,
        client: String(project.client),
      })),
    [projects],
  );

  const modalInitialValues = useMemo(() => {
    const now = dayjs();
    const monthStart = now.startOf("month");

    return {
      startDate: monthStart.toDate(),
      endDate: now.toDate(),
      clientId: clientOptions[0]?._id ?? "",
      projectId: "",
    };
  }, [clientOptions]);

  async function handleCreateInvoice(values: InvoiceModalSubmitValues) {
    const selectedClient = clients.find(
      (client) => String(client._id) === values.clientId,
    );
    if (!selectedClient) {
      throw new Error("Select a valid client.");
    }

    const selectedProject = values.projectId
      ? projects.find((project) => String(project._id) === values.projectId)
      : null;
    if (values.projectId && !selectedProject) {
      throw new Error("Select a valid project.");
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      await createInvoice({
        clientId: selectedClient._id,
        ...(selectedProject ? { projectId: selectedProject._id } : {}),
        startAt: values.startAt,
        endAt: values.endAt,
      });
      setModalVisible(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function openModal() {
    if (clients.length === 0) {
      setErrorMessage("Create a client before creating invoices.");
      return;
    }

    setErrorMessage(null);
    setModalVisible(true);
  }

  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 16,
          gap: 14,
        }}
      >
        <Card
          eyebrow="Billing"
          title="Invoices"
          description="Create invoices from date ranges now, and wire full totals later."
          footer={
            <View className="gap-2">
              <Button
                label="New invoice"
                onPress={openModal}
                loading={busy}
              />
              <View className="flex-row items-center gap-2">
                <FontAwesome6
                  name="file-invoice-dollar"
                  size={12}
                  color={palette.muted}
                />
                <Text className="text-xs" color="muted">
                  {results.length} {results.length === 1 ? "invoice" : "invoices"}
                </Text>
              </View>
            </View>
          }
        >
          <InlineNotice
            tone="neutral"
            message="Invoices are sorted by newest created first."
          />
          <InlineNotice message={errorMessage} />
        </Card>

        {isLoading && results.length === 0 ? (
          <View
            className="rounded-2xl border px-4 py-10"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.surfaceStrong,
            }}
          >
            <ActivityIndicator color={palette.accent} />
            <Text className="mt-3 text-center text-sm" color="muted">
              Loading invoices...
            </Text>
          </View>
        ) : null}

        {!isLoading && results.length === 0 ? (
          <View
            className="rounded-2xl border px-4 py-8"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.surfaceStrong,
            }}
          >
            <Text className="text-base" weight="600">
              No invoices yet
            </Text>
            <Text className="mt-2 text-sm leading-6" color="muted">
              Create your first invoice using a date range and client scope.
            </Text>
          </View>
        ) : null}

        <View className="gap-3">
          {results.map((invoice) => {
            const rangeLabel = `${dayjs(invoice.startAt).format("MMM D, YYYY")} - ${dayjs(
              invoice.endAt,
            ).format("MMM D, YYYY")}`;
            const createdLabel = dayjs(invoice._creationTime).format(
              "MMM D, YYYY h:mm A",
            );
            const amountLabel =
              invoice.amount > 0 ? `Amount ${invoice.amount}` : "Amount pending";
            const projectLabel = invoice.projectName ?? "All client projects";

            return (
              <View
                key={String(invoice._id)}
                className="rounded-2xl border px-4 py-4 md:px-5"
                style={{
                  borderColor: palette.border,
                  backgroundColor: palette.surfaceStrong,
                }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base" weight="600">
                      {rangeLabel}
                    </Text>
                    <Text className="mt-1 text-sm" color="muted">
                      {invoice.clientName} • {projectLabel}
                    </Text>
                  </View>
                  <View
                    className="rounded-lg border px-2 py-1"
                    style={{
                      borderColor: palette.inputBorder,
                      backgroundColor: palette.input,
                    }}
                  >
                    <Text
                      className="text-[11px]"
                      color="muted"
                      style={{ letterSpacing: 0.5 }}
                    >
                      {invoice.paidAt ? "Paid" : "Unpaid"}
                    </Text>
                  </View>
                </View>
                <View className="mt-3 flex-row items-center justify-between gap-3">
                  <Text className="text-xs" color="muted">
                    Created {createdLabel}
                  </Text>
                  <Text className="text-xs" weight="500">
                    {amountLabel}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {status !== "Exhausted" ? (
          <Button
            label={status === "LoadingMore" ? "Loading..." : "Load more invoices"}
            variant="secondary"
            loading={status === "LoadingMore"}
            onPress={() => {
              if (status === "CanLoadMore") {
                loadMore(PAGE_SIZE);
              }
            }}
          />
        ) : null}
      </ScrollView>

      <InvoiceModal
        visible={modalVisible}
        busy={busy}
        initialValues={modalInitialValues}
        clients={clientOptions}
        projects={projectOptions}
        onClose={() => {
          if (busy) {
            return;
          }
          setModalVisible(false);
        }}
        onSubmit={handleCreateInvoice}
      />
    </View>
  );
}
