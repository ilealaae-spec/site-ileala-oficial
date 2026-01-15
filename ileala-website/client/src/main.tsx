import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
// Sanity removed - no longer needed
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Check if we're on admin domain - if so, redirect to /login instead of OAuth
  const isAdminDomain = window.location.hostname === 'admin.ileala.ae' || 
                       window.location.hostname.includes('admin');
  
  if (isAdminDomain) {
    // On admin domain, always use direct login page, not OAuth
    window.location.href = '/login';
  } else {
    // On main domain, use OAuth login URL
    window.location.href = getLoginUrl();
  }
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

// Determine API URL based on environment
const getApiUrl = () => {
  // In browser, check if we're on admin domain
  if (typeof window !== 'undefined') {
    const isAdminDomain = window.location.hostname === 'admin.ileala.ae' ||
                         window.location.hostname.includes('admin');
    // Admin domain should use the backend API directly
    if (isAdminDomain) {
      return 'https://api-ileala.up.railway.app/api/trpc';
    }
  }
  // Default to relative URL (works for CLIENT service)
  return '/api/trpc';
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      fetch(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        console.log('[tRPC] Request:', url);
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then(async (response) => {
          console.log('[tRPC] Response:', response.status, response.statusText);

          // Clone response to read body for debugging if needed
          const clonedResponse = response.clone();
          const contentType = response.headers.get('content-type') || '';

          // Check for CORS error (no body, status 0)
          if (response.status === 0) {
            console.error('[tRPC] CORS error - request blocked');
            return new Response(
              JSON.stringify([{
                error: {
                  message: 'CORS error: Request was blocked. Please check server configuration.',
                  code: 'CORS_ERROR',
                  data: { code: 'CORS_ERROR', httpStatus: 0 },
                },
              }]),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // If response is not JSON, try to get the text for debugging
          if (!contentType.includes('application/json')) {
            const text = await clonedResponse.text().catch(() => 'Unable to read response');
            console.error('[tRPC] Non-JSON response:', text.substring(0, 500));

            return new Response(
              JSON.stringify([{
                error: {
                  message: 'Server returned non-JSON response. Please try again.',
                  code: 'PARSE_ERROR',
                  data: { code: 'PARSE_ERROR', httpStatus: response.status },
                },
              }]),
              { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
          }

          // Log successful response body for debugging
          if (response.ok) {
            try {
              const bodyText = await clonedResponse.text();
              console.log('[tRPC] Response body preview:', bodyText.substring(0, 200));
            } catch (e) {
              console.log('[tRPC] Could not read response body for logging');
            }
          }

          return response;
        }).catch((error) => {
          console.error('[tRPC] Fetch error:', error.message || error);
          return new Response(
            JSON.stringify([{
              error: {
                message: error.message || 'Network error. Please check your connection.',
                code: 'NETWORK_ERROR',
                data: { code: 'NETWORK_ERROR', httpStatus: 500 },
              },
            }]),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
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
      {/* Sanity removed - no longer needed */}
    </QueryClientProvider>
  </trpc.Provider>
);
