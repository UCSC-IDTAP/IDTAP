<template>
  <div class='outer'>
    <div class='titleRow'>
      <span class='title'>Swara.Studio</span>
      <span class='subtitle'>{{ subtitleText }}</span>
      <div class='buttonRow'>
        <div class='enterButton' @click='goToLogin'>Enter IDTAP</div>
        <div class='demosButton'>
          <a href='https://www.youtube.com/channel/UCSsnBpY5Hh8mvZu-63lpmaQ'>
            Demos
          </a>
        </div>
        <div class='enterButton' @click='goToChangelog'>Changelog</div>
      </div>
    </div>
      <div class='infoRowInner'>
        <div v-for='(item, index) in info' :key='index' class='infoItem'>
          <span class='infoItemHeading'>{{ item.heading }}</span>
          <span class='infoItemText'>{{ item.text }}</span>
        </div>
      </div>
      <div class='sponsorsRowOuter'>
        <div class='sponsorsRow'>
          <div><img :src='logos.neh'></div>
          <div><img :src='logos.or'></div>
          <div><img :src='logos.ari'></div>
          <div><img :src='logos.e'></div>
        </div>
      </div>
      <div class='bottomRow'>
        <div class='bottomRowInner'>
          <div class='chasmsBox'><img :src='logos.chasms'></div>
          <div class='support'>
            <div class='supportTitle'>Support</div>
            <div class='supportRow'>
              <a href='https://github.com/jon-myers/idtp'>Github</a>
            </div>
            <div class='supportRow'>
              <a href='https://github.com/jon-myers/idtp/issues'>
                Github Issues
              </a>
            </div>
            <div class='supportRow'>FAQ</div>
            <div class='supportRow'>
              <a href='/privacy-policy.html'>Privacy Policy</a>
            </div>
          </div>
          <div class='projectTeam'>
            <div class='projectTeamTitle'>Principal Investigators</div>
            <div class='projectTeamRow'>
              <a href='https://music.ucsc.edu/people/dard-neuman'>
                Dard Neuman
              </a>
            </div>
            <div class='projectTeamRow'>
              <a href='https://music.ucsc.edu/people/jonathan-myers'>
                Jon Myers
              </a>
            </div>
            <div class='projectTeamTitle'>Graduate Researcher</div>
            <div class='projectTeamRow'>
              <a href='https://music.ucsc.edu/people/balakrishnan-raghavan'>
                Balakrishnan Raghavan
              </a>
            </div>
            <div class='projectTeamTitle'>Project Intern</div>
            <div class='projectTeamRow'>
              Shreyas Anand
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script lang='ts'>
import nehURL from '@/assets/logos/NEH_logo.jpg';
import ariURL from '@/assets/logos/ARI_logo.png';
import orURL from '@/assets/logos/OR_logo.png';
import eURL from '@/assets/logos/Endowment_logo.png';
import chasmsURL from '@/assets/logos/chasms_logo.png';

export default {
  name: 'LandingPage',
  data() {
    return {
      logos: {
        neh: nehURL,
        ari: ariURL,
        or: orURL,
        e: eURL,
        chasms: chasmsURL
      },
      layerColors: [
        '#50945c'
      ],
      subtitleText: "An Interactive Digital Transcription and Analysis Platform (IDTAP) that \
        enables transcription, archiving, sharing, and analysis of audio \
        recordings of oral melodic and improvisation traditions, with a first \
        focus on Hindustani music.",
      info: [
        {
          heading: 'Musical Transcription',
          text: 'Intuitive and flexible transcription tools and notation \
            system designed to better represent the finely calibrated \
            glissandi (continuous melodic contours across and between pitches) \
            that appear in many musical traditions outside of the European and \
            U.S. keyboard and staff oriented paradigms of music.'
        },
        {
          heading: 'Theoretical Identity',
          text: 'The IDTAP is organized around a succession of “trajectories”: \
            formally specified, flexible basic units of musical continuity \
            that follow archetypal paths or curves from one pitch to another, \
            or among a series of pitches. Trajectories can be marked and \
            expressed with a variety of instrument-specific articulations, \
            allowing transcriptions to capture the performance practices of \
            specific traditions / idioms.'
        },
        {
          heading: 'Synthesis',
          text: 'The IDTAP Editor includes custom synthesis engines associated \
            with each supported instrument, allowing the user to aurally \
            verify the accuracy of their transcription as measured up against \
            the original recording.'
        },
        {
          heading: 'Analysis',
          text: 'The IDTAP includes a suite of analysis tools that allow users \
            to analyze their transcriptions quantitatively and \
            computationally, at a large scale across a range of performances \
            (diachronically or synchronically), or at a small scale through \
            specific measurements within a single performance, or even a \
            single phrase.'
        }
      ]
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/logIn');
    },

    goToChangelog() {
      this.$router.push('/changelog');
    }
  }
}
</script>

<style scoped>
.titleBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  
}

.outer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  background-color: #10abb6;

}

.logosBox {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.logoImg {
  height: 150px;
  margin: 10px;
}

.logoImgBox {
  height: 150px;
  width: 500px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.titleRow {
  background-color: #50945c;
  /* min-height: 250px; */
  /* max-height: 600px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  color: white;
  width: 100%;
  max-width: 100%;
}

.title {
  /* min-width: 200px; */
  height: 70px;
  width: calc(100% - 160px);
  display: flex;
  align-items: center;
  justify-content: left;
  text-align: left;
  font-size: 30px;
  font-weight: bold;
}

.subtitle {
  /* min-width: 200px; */
  /* max-width: 950px; */
  width: calc(100% - 160px);
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: left;
  text-align: left;
  font-size: 20px;
}
.buttonRow {
  width: calc(100% - 160px);
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}




.buttonRow > div {
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #b58500;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  transition: color 0.3s ease;
  margin-right: 10px;
}

.buttonRow > div:hover {
  background-color: #F9E0A9;
  color: black;
}

.infoRowInner {
  width: calc(100% - 160px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  color: #242660;
  background-color: #F9E0A9;
  padding-left: 80px;
  padding-right: 80px;
}

.infoItem {
  height: 260px;
  flex: 1 0 20%;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
}

@media (max-width: 800px) {
  .infoItem {
    flex: 1 0 40%
  }
  
  .sponsorsRow > img {
    flex: 1 0 40%;
  }
}

@media (max-width: 400px) {
  .infoItem {
    flex: 1 0 80%;
  }
}

.infoItemHeading {
  font-size: 20px;
  font-weight: bold;
  text-align: left;
}

.infoItemText {
  font-size: 13px;
  width: 250px;
  max-height: 250px;
  text-align: justify;
}

.outer {
  font: 15px/1.5 "Helvetica Neue", Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: top;
  overflow: auto;
}

.sponsorsRow {
  background-color: white;
  width: calc(100% - 160px);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.sponsorsRowOuter {
  background-color: white;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.sponsorsRow > div > img {
  width: 230px;
}

.sponsorsRow > div {
  height: 150px;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bottomRowInner {
  background-color: #10abb6;
  min-height: 260px;
  width: calc(100% - 160px);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
}

.bottomRow {
  background-color: #10abb6;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.chasmsBox > img {
  width: 170px;
  height: 170px;
  margin-right: 40px;
}

.chasmsBox {
  width: 250px;
  height: 170px;

}

.support {
  width: 180px;
  height: 170px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: top;
  color: white;
}

.supportTitle {
  font-size: 22px;
  text-align: left;
}

.supportRow {
  width: 100%;
  text-align: left;
}

.projectTeam {
  color: white;
  width: 250px;
  height: 170px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: top;
}

.projectTeamTitle {
  font-size: 22px;
  text-align: left;
}

.projectTeamRow {
  width: 100%;
  text-align: left;
}
</style>
