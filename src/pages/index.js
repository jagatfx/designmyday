import React from "react"
import { Link } from "gatsby"

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

import logo from '../images/dmd-blackwhite.png'
import molly from '../images/molly-399x250.png'
import mountains from '../images/in-mountains.jpg'
import tree from '../images/under-tree.jpg'
import mollyHappy from '../images/molly-happy-sm.png'

const IndexPage = () => (
  <Layout>
    <SEO title="Design My Day" />
    <section className="section-intro text-xs-center">
      <img id="molly" src={logo} alt="Design My Day logo" className="img-fluid wp wp-3 text-center" />
      <div className="container">
        <h3 className="wp wp-1">Personalized Life Guidance</h3>
        <p className="wp wp-2">
          Design My Day is an investigation into the use of artificial intelligence and machine learning technologies to help people improve their self-efficacy and their lives.
        </p>
      </div>
    </section>
    <button type="button" className="btn btn-primary btn-lg btn-block">Do something and feel better</button>
    <section className="section-intro text-xs-center">
      <div className="container">
        <h3 className="wp wp-1">Your life is a series of choices</h3>
        <div className="wp wp-2">
          <ul>
            <ul>Do you know who you are today?</ul>
            <ul>Do you know who you want to be in the future?</ul>
            <ul>Do you know what you want to do?</ul>
            <ul>Design your days and live an intentional life.</ul>
          </ul>
        </div>
        <h3 className="wp wp-1">Have you experienced the funk?</h3>
        <div className="wp wp-2">
          <ul>
            <li>Feeling depressed? Feeling helpless? Feeling discouraged?</li>
            <li>We’ve all been there. The things that normally make you happy begin to bring you down.</li>
            <li>You cannot seem to understand why.</li>
          </ul>
        </div>
        <img id="molly" src={molly} alt="Design My Day Molly" className="img-fluid wp wp-3 text-center" />
        <h3 className="wp wp-1">Let's explore a way forward</h3>
        <p className="wp wp-2">
        Doing something, even something very small, is a fantastic way to escape negative thoughts and feelings. Sometimes hard to think of new ideas while stuck, we crowd-source ideas from others.
        </p>
      </div>
    </section>
{/*    <section className="section-features text-xs-center">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-block">
                <span className="icon-pen display-1"></span>
                <h4 className="card-title">Artificial Intelligence</h4>
                <h6 className="card-subtitle text-muted">Advanced Capabilities</h6>
                <p className="card-text">Integrating state-of-the-art technologies to harness the latest coaching approaches.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-block">
                <span className="icon-heart display-1"></span>
                <h4 className="card-title">Self-efficacy Focus</h4>
                <h6 className="card-subtitle text-muted">Improvement</h6>
                <p className="card-text">Enhance beliefs about your ability to do things. Approach challenges from a place of strength rather than with fear of a potential threat that should be avoided.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card m-b-0">
              <div className="card-block">
                <span className="icon-thunderbolt display-1"></span>
                <h4 className="card-title">Machine Learning</h4>
                <h6 className="card-subtitle text-muted">Natural Language Conversations</h6>
                <p className="card-text">Short and interesting interactions to help enrich your day.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <button type="button" className="btn btn-primary btn-lg btn-block">Activity Ideas</button>
    <section className="section-news">
      <div className="container">
        <div className="bg-inverse">
          <div className="row">
            <div className="col-md-6 p-r-0">
              <figure className="has-light-mask m-b-0 image-effect">
                <img src={mountains} alt="In the mountains" className="img-fluid" />
              </figure>
            </div>
            <div className="col-md-6 p-l-0">
              <article className="center-block">
                <h5>Hike through the mountains</h5>
              </article>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-md-push-6 p-l-0">
              <figure className="has-light-mask m-b-0 image-effect">
                <img src={tree} alt="Under tree" className="img-fluid" />
              </figure>
            </div>
            <div className="col-md-6 col-md-pull-6 p-r-0">
              <article className="center-block">
                <h5>Walk around an old tree</h5>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>*/}
    <button type="button" className="btn btn-primary btn-lg btn-block">More coming soon</button>
    <section className="section-signup">
      <div className="container">
        <img id="molly" src={mollyHappy} alt="Design My Day Molly" className="img-fluid wp wp-3 text-center" />
        <h3 className="text-xs-center m-b-3">Sign up to receive free updates!</h3>

        <form action="//designmyday.us12.list-manage.com/subscribe/post?u=905eda965365a3c5089a59267&amp;id=ea937097ef" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate>
          <div id="row">
            <div className="col-md-6">
              <div className="form-group has-icon-left form-control-email">
                <label className="sr-only" htmlFor="inputEmail">Email address</label>
                <input type="email" defaultValue="" name="EMAIL" className="email form-control form-control-lg" id="mce-EMAIL" placeholder="email address" required />
              </div>
            </div>
            <div className="col-md-6">
              <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
                <input type="text" name="b_905eda965365a3c5089a59267_ea937097ef" tabIndex="-1" defaultValue="" />
              </div>
              <div className="form-group">
                <input type="submit" value="Sign up for free!" name="subscribe" id="mc-embedded-subscribe" className="btn btn-primary btn-block" />
              </div>
            </div>
          </div>
        </form>

      </div>
    </section>
  </Layout>
)

export default IndexPage
