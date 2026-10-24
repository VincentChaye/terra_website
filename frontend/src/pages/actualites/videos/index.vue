<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import { getVideos } from "@/lib/content";

const videos = getVideos(); // synchrone → page statique
</script>

<template>
  <div>
    <PageHeader
      title="Vidéothèque"
      :breadcrumb="[{ label: 'Actualités', href: '/actualites' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Revivez des temps forts de Terra Numerica !
      </p>

      <template v-if="videos.length === 0"><p class="text-white/85 leading-relaxed">
          Retrouvez toutes les vidéos Terra Numerica sur notre chaîne YouTube :
          <a
            href="https://www.youtube.com/@TerraNumericaOfficial"
            target="_blank"
            rel="noopener noreferrer"
            class="text-tn-blue hover:underline"
          >
            youtube.com/@TerraNumericaOfficial</a>.
        </p></template><template v-else><div class="grid sm:grid-cols-2 gap-6">
          <article v-for="video in videos"
              :key="video.id"
              class="rounded-xl border border-white/10 bg-white/3 overflow-hidden"
            >
              <template v-if="video.youtubeId"><div class="aspect-video">
                  <iframe
                    :src="`https://www.youtube.com/embed/${video.youtubeId}`"
                    :title="video.title"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    class="w-full h-full"
                  />
                </div></template>
              <div class="px-4 py-3">
                <h2 class="text-sm font-semibold text-white leading-snug">{{ video.title }}</h2>
                <template v-if="video.description"><p class="text-white/60 text-xs mt-1 leading-relaxed">{{ video.description }}</p></template>
                <p class="text-white/35 text-xs mt-1">{{ video.date.slice(0, 4) }}</p>
              </div>
            </article>
        </div></template>
    </div>
  </div>
</template>
