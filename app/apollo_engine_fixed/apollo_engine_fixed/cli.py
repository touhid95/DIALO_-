"""Apollo extraction engine CLI.

Commands:
  health                              verify the API key
  discover                            STEP 1 lookup + STEP 2 dispatch
  status <person_id> [...]            STEP 3 phone_enrichment_status checks
  show [request_id]                   STEP 3 webhook_result/show historical pull
  poll                                STEP 3 poll saved request ids
  webhook                             run the local webhook receiver
  agent <person_id> [...]             bulk agents/task dispatch
"""

import sys

import cli_dispatch


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    try:
        return cli_dispatch.run()
    except KeyboardInterrupt:
        print("[!] Interrupted.")
        return 130


if __name__ == "__main__":
    sys.exit(main())