import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then(async (response) => {
          // Check if response is JSON, if not, convert to JSON error
          const contentType = response.headers.get('content-type') || '';
          const isErrorStatus = response.status >= 400;
          
          if (isErrorStatus && !contentType.includes('application/json')) {
            // Read the text response
            const text = await response.text().catch(() => 'Unknown error');
            console.error('[Client] Non-JSON error response:', text.substring(0, 200));
            
            // Create a new Response with JSON error
            return new Response(
              JSON.stringify({
                error: {
                  message: text.includes('server error') || text.includes('Server Error')
                    ? 'A server error occurred. Please try again later.'
                    : 'An unexpected error occurred',
                  code: 'INTERNAL_SERVER_ERROR',
                },
              }),
              {
                status: response.status,
                statusText: response.statusText,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
          
          return response;
        }).catch((error) => {
          console.error('[Client] Fetch error:', error);
          // Return a JSON error response for network errors
          return new Response(
            JSON.stringify({
              error: {
                message: 'Network error. Please check your connection and try again.',
                code: 'NETWORK_ERROR',
              },
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
