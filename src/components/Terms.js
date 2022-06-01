import './Terms.css';

function Terms() {
  return (
    <div className="Terms">
      <h2>Terms Of Service</h2>
      <div>
        THIS SERVICE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE SERVICE PROVIDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THIS SERVICE OR THE USE OR OTHER DEALINGS IN
        THIS SERVICE.
      </div>
      <div>
        The underlying software of this service is open source, and can be reviewed in the following repositories:{' '}
        <a href="https://github.com/simontakouridis/idena-community-wallet" target="_blank" rel="noreferrer">
          Frontend
        </a>{' '}
        and{' '}
        <a href="https://github.com/simontakouridis/idena-community-wallet-api" target="_blank" rel="noreferrer">
          Backend
        </a>
      </div>
    </div>
  );
}

export default Terms;
