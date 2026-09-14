"use client";

import { useConsent } from "@/components/consent/ConsentProvider";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { offerContent } from "@/lib/content";
import { getCookie, getTtclidFromUrl, trackLeadConversion } from "@/lib/tracking/events";
import { cn } from "@/lib/utils";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead.schema";
import type { LeadApiResponse } from "@/types/lead";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const inputClasses = cn(
  "w-full rounded-md border border-black/15 bg-white px-4 py-3 text-base text-brand",
  "placeholder:text-brand-muted/70 outline-none transition-colors",
  "focus:border-brand-accent focus:ring-1 focus:ring-brand-accent",
  "disabled:cursor-not-allowed disabled:opacity-60"
);

export function LeadForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const { status: consentStatus } = useConsent();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      company: "", // honeypot
      dataConsent: false,
      adsConsent: false,
    },
    mode: "onBlur",
  });

  // Capture des identifiants de matching Ads dès le montage (sans bloquer le rendu du formulaire).
  // Un event_id unique est généré une fois par affichage du formulaire pour la dédup pixel/CAPI.
  useEffect(() => {
    setValue("eventId", crypto.randomUUID());
    setValue("source", typeof window !== "undefined" ? window.location.pathname : undefined);
  }, [setValue]);

  // Les identifiants _fbp/_fbc/ttclid ne sont capturés que si l'utilisateur a consenti :
  // s'il a refusé, ces cookies n'existent de toute façon pas (pixel jamais chargé).
  useEffect(() => {
    setValue("adsConsent", consentStatus === "granted");
    if (consentStatus === "granted") {
      setValue("fbp", getCookie("_fbp"));
      setValue("fbc", getCookie("_fbc"));
      setValue("ttclid", getTtclidFromUrl());
    }
  }, [consentStatus, setValue]);

  const onSubmit = useCallback(
    async (values: LeadFormValues) => {
      setStatus("submitting");
      setServerError(null);

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = (await res.json()) as LeadApiResponse;

        if (!res.ok || !data.success) {
          setServerError(
            !data.success ? data.error : "Une erreur est survenue. Merci de réessayer."
          );
          setStatus("error");
          return;
        }

        // Conversion trackée uniquement en cas de succès confirmé côté serveur,
        // et uniquement si le pixel a pu se charger (consentement accordé).
        if (values.adsConsent && values.eventId) {
          trackLeadConversion(values.eventId, { content_name: "lead-form" });
        }
        setStatus("success");
        reset();
      } catch {
        setServerError("Impossible de contacter le serveur. Vérifiez votre connexion.");
        setStatus("error");
      }
    },
    [reset]
  );

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-6 text-center"
      >
        <p className="text-lg font-semibold text-brand">Demande envoyée avec succès.</p>
        <p className="mt-2 text-sm text-brand-muted">
          Vous serez recontacté rapidement. Merci pour votre confiance.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Prénom" htmlFor="firstName" error={errors.firstName?.message}>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            className={inputClasses}
            placeholder="Jean"
            disabled={status === "submitting"}
            {...register("firstName")}
          />
        </FormField>

        <FormField label="Nom" htmlFor="lastName" error={errors.lastName?.message}>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className={inputClasses}
            placeholder="Dupont"
            disabled={status === "submitting"}
            {...register("lastName")}
          />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className={inputClasses}
          placeholder="jean.dupont@email.fr"
          disabled={status === "submitting"}
          {...register("email")}
        />
      </FormField>

      <FormField label="Message" htmlFor="message" error={errors.message?.message}>
        <textarea
          id="message"
          rows={4}
          className={cn(inputClasses, "resize-none")}
          placeholder={offerContent.messagePlaceholder}
          disabled={status === "submitting"}
          {...register("message")}
        />
      </FormField>

      {/* Honeypot anti-bot : invisible et hors flux de tabulation pour un humain. */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Ne pas remplir ce champ</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      {/* Champs cachés de tracking, injectés via setValue au montage. */}
      <input type="hidden" {...register("fbp")} />
      <input type="hidden" {...register("fbc")} />
      <input type="hidden" {...register("ttclid")} />
      <input type="hidden" {...register("source")} />
      <input type="hidden" {...register("eventId")} />
      <input type="hidden" {...register("adsConsent")} />

      {/* Consentement RGPD léger, spécifique au traitement de la demande de contact. */}
      <label htmlFor="dataConsent" className="flex items-start gap-2 text-xs text-brand-muted">
        <input
          id="dataConsent"
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-brand-accent focus:ring-brand-accent"
          disabled={status === "submitting"}
          {...register("dataConsent")}
        />
        <span>
          J&apos;accepte que mes informations soient utilisées pour être recontacté(e) au sujet de
          cette demande.
        </span>
      </label>
      {errors.dataConsent ? (
        <p role="alert" className="-mt-2 text-sm text-red-600">
          {errors.dataConsent.message}
        </p>
      ) : null}

      {serverError ? (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" isLoading={status === "submitting"}>
        Envoyer ma demande
      </Button>
    </form>
  );
}
